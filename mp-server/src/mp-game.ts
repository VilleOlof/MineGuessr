import { GameModule } from "../../shared/GameModule";
import * as THREE from "three";
import { ROUNDS_PER_MATCH, location_metadata } from "../../shared";
import { Config, PlayerData } from "../../shared/MP";
import EventEmitter from "events";
import { GameHandler } from "./game_handler";

export class MPGame {
    private static PLAYER_LIMIT: number = 3;
    private static IDLE_TIMEOUT: number = 1000 * 60 * 5;

    public static get_event_name(event: string, game_id: string) {
        return `${event}:${game_id}`;
    }

    public static MPEvents: EventEmitter = new EventEmitter();

    private _state: MPGame.State = "lobby";

    public set state(value: MPGame.State) {
        this.update_latest_activity();
        this._state = value;

        MPGame.MPEvents.emit(
            MPGame.get_event_name(MPGame.Event.GAME_STATE_CHANGE, this.game_id), {
            state: value,
            game_id: this.game_id
        });
    }

    public get state() {
        return this._state;
    }

    public config: Config = {
        panoramas: [],
        visibility: "private"
    };
    public game_id: string;

    public idle_data: MPGame.IdleData = {
        created_at: Date.now(),
        last_updated: Date.now(),
        timeout: null
    };

    public static inbetween_round_time: number = 1000 * 20;
    public inbetween_round_timeout: NodeJS.Timeout | null = null;
    // ###
    public static guess_timeout: number = 1000 * 30;
    public guess_timeout: NodeJS.Timeout | null = null;

    public players: { [key: string]: PlayerData } = {};

    public current_round: number = 0;

    public constructor(panoramas: location_metadata[]) {
        this.state = "lobby";
        this.config.panoramas = panoramas;

        this.game_id = MPGame.generate_game_id();
    }

    public self_destruct() {
        if (!["aborted", "finished", "error"].includes(this.state)) return;

        if (this.idle_data.timeout) clearTimeout(this.idle_data.timeout);
        if (this.guess_timeout) clearTimeout(this.guess_timeout);
        if (this.inbetween_round_timeout) clearTimeout(this.inbetween_round_timeout);
        delete GameHandler.games[this.game_id];
    }

    private update_latest_activity() {
        this.idle_data.last_updated = Date.now();

        if (this.idle_data.timeout) {
            clearTimeout(this.idle_data.timeout);
        }

        this.idle_data.timeout = setTimeout(() => {
            // TODO: Broadcast to clients?
            this.state = "aborted";
        }, MPGame.IDLE_TIMEOUT);
    }

    public add_player(player: string) {
        if (Object.keys(this.players).length >= MPGame.PLAYER_LIMIT) {
            throw new Error("Game is full");
        }

        if (this.state !== "lobby") {
            throw new Error("Game is not in lobby state");
        }

        this.players[player] = {
            rounds: [],
            lobby_ready: false
        };

        const round_template = {
            location: new THREE.Vector2(),
            guess_location: new THREE.Vector2(),
            distance: 0,
            time: 0,
            score: 0,
            panorama_id: 0,
            finished: false
        };

        for (let i = 0; i < ROUNDS_PER_MATCH; i++) {
            this.players[player].rounds.push({
                ...round_template,
                panorama_id: this.config.panoramas[i].id,
                ready_for_next: false
            });
        }

        this.update_latest_activity();
    }

    public remove_player(player: string) {
        if (this.players[player]) {
            delete this.players[player];
        }
        const players_left = Object.keys(this.players).length;
        if (players_left === 0 || players_left === 1) {
            this.state = "aborted";
        }

        this.update_latest_activity();
    }

    public all_players_ready() {
        for (const player_id in this.players) {
            if (!this.players[player_id].lobby_ready) {
                return false;
            }
        }

        this.update_latest_activity();
        return true;
    }

    private static generate_game_id() {
        const LENGTH: number = 5;
        let id = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (let i = 0; i < LENGTH; i++) {
            id += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return id;
    }

    public start_game() {
        if (this.state !== "lobby") {
            throw new Error("Game is not in lobby state");
        }

        this.state = "playing";

        this.update_latest_activity();
    }

    public get_current_panorama_data() {
        if (this.state !== "playing" && this.state !== "intermission") {
            throw new Error("Game is not in playing state");
        }

        this.update_latest_activity();
        return this.config.panoramas[this.current_round];
    }

    public next_round() {
        if (this.state !== "playing" && this.state !== "intermission") {
            throw new Error("Game is not in playing state");
        }
        if (this.current_round >= ROUNDS_PER_MATCH) {
            throw new Error("No more rounds left");
        }

        if (this.guess_timeout) {
            clearTimeout(this.guess_timeout);
            this.guess_timeout = null;
        }
        if (this.inbetween_round_timeout) {
            clearTimeout(this.inbetween_round_timeout);
            this.inbetween_round_timeout = null;
        }

        this.current_round++;
        this.state = "playing";

        for (const player_id in this.players) {
            const [x, z] = this.config.panoramas[this.current_round].coordinates;
            const round = this.players[player_id].rounds[this.current_round];

            this.players[player_id].rounds[this.current_round] = {
                ...round,
                location: new THREE.Vector2(x, z),
                ready_for_next: false
            }
        }

        this.update_latest_activity();
    }

    public guess_location(player_id: string, guess: THREE.Vector2): GameModule.Round {
        if (this.state !== "playing") {
            throw new Error("Game is not in playing state");
        }

        const round = this.players[player_id].rounds[this.current_round];

        if (round.finished) {
            throw new Error("Round is already finished");
        }

        round.guess_location = guess;
        round.distance = round.location.distanceTo(guess);
        round.score = GameModule.calculate_score(round.distance);
        round.finished = true;

        this.update_latest_activity();
        return round;
    }

    public ready_for_next_round(player_id: string) {
        if (this.state !== "intermission") throw new Error("Game is not in playing state");

        const round = this.players[player_id].rounds[this.current_round];

        if (round.ready_for_next) throw new Error("Player is already ready for next round");

        this.update_latest_activity();
        round.ready_for_next = true;
    }

    public all_players_ready_for_next_round() {
        for (const player_id in this.players) {
            if (!this.players[player_id].rounds[this.current_round].ready_for_next) {
                return false;
            }
        }

        this.update_latest_activity();
        return true;
    }

    public all_players_guessed() {
        for (const player_id in this.players) {
            if (!this.players[player_id].rounds[this.current_round].finished) {
                return false;
            }
        }

        this.update_latest_activity();
        return true;

    }

    public get_players_round_data(): { [key: string]: GameModule.Round } {
        if (this.state !== "playing" && this.state !== "intermission") {
            throw new Error("Game is not in playing state");
        }

        const data: { [key: string]: GameModule.Round } = {};

        for (const player_id in this.players) {
            data[player_id] = this.players[player_id].rounds[this.current_round];
        }

        this.update_latest_activity();
        return data;
    }

    public get_all_players_data(): { [key: string]: GameModule.Round[] } {
        if (this.state !== "finished") {
            throw new Error("Game is not in finished state");
        }

        const data: { [key: string]: GameModule.Round[] } = {};

        for (const player_id in this.players) {
            data[player_id] = this.players[player_id].rounds;
        }

        this.update_latest_activity();
        return data;
    }
}

export module MPGame {
    export type State = "lobby" | "playing" | "intermission" | "finished" | "aborted" | "error";

    export type IdleData = {
        created_at: number;
        last_updated: number;
        timeout: NodeJS.Timeout | null;
    };

    export const Event = {
        GAME_STATE_CHANGE: "game_state_change"
    };
}