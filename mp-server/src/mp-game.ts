import { GameModule } from "../../shared/GameModule";
import * as THREE from "three";
import { ROUNDS_PER_MATCH, location_metadata } from "../../shared";
import { Config, MPRound, PlayerData, State } from "../../shared/MP";
import EventEmitter from "events";
import { GameHandler } from "./game_handler";
import { get_user } from "./auth";

// TODO: Send stats to db
// TODO: Calculate and keep track of time each user spent on each round
export class MPGame {
    public static MIN_PLAYERS: number = 2;
    private static IDLE_TIMEOUT: number = 1000 * 60 * 5;

    public static get_event_name(event: string, game_id: string) {
        return `${event}:${game_id}`;
    }

    public static MPEvents: EventEmitter = new EventEmitter();

    private _state: State = "lobby";

    public set state(value: State) {
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
        visibility: "private",
        game_creator: "Unknown",
        game_name: "Unknown",
        player_limit: MPGame.MIN_PLAYERS
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

    public current_round: number = -1;

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
        if ((Bun.env.DISABLE_GAME_IDLE?.toLowerCase() === "true") ?? false) return;

        if (this.idle_data.timeout) {
            clearTimeout(this.idle_data.timeout);
        }

        this.idle_data.timeout = setTimeout(() => {
            this.state = "aborted";
            console.log(`Game ${this.game_id} timed out`);
        }, MPGame.IDLE_TIMEOUT);
    }

    public set_game_creator(player_id: string) {
        this.config.game_creator = player_id;
    }

    public add_player(player: string) {
        if (Object.keys(this.players).length >= this.config.player_limit) {
            throw new Error("Game is full");
        }

        if (this.state !== "lobby") {
            throw new Error("Game is not in lobby state");
        }

        const user_data = get_user(player);
        if (!user_data) throw new Error("User not found");

        this.players[player] = {
            rounds: [],
            discord: {
                user_id: user_data.user_id,
                username: user_data.username,
                avatar: user_data.avatar,
            },
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
                ready_for_next: false,
                started_at: 0
            });
        }

        this.update_latest_activity();
    }

    public remove_player(player: string) {
        if (this.players[player]) {
            delete this.players[player];
        }
        const players_left = Object.keys(this.players).length;
        if (players_left <= 0) {
            this.state = "aborted";
            console.log(`Game ${this.game_id} has no players left`);
        }

        // Only abort if the player count is less than the minimum required
        // But there can be people who leave and the game still goes on
        if (this.state !== "lobby" && players_left < MPGame.MIN_PLAYERS) {
            this.state = "aborted";
            console.log(`Game ${this.game_id} has too few players`);
        }

        this.update_latest_activity();
    }

    public all_players_ready() {
        this.update_latest_activity();

        let players_ready: number = 0;

        for (const player_id in this.players) {
            if (this.players[player_id].lobby_ready) {
                players_ready += 1;
            }
        }

        if (players_ready === this.config.player_limit) {
            return true;
        }

        return false;
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
        this.next_round();

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
                ready_for_next: false,
                started_at: Date.now()
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
        round.time = MPGame.calculate_time(round);

        this.update_latest_activity();
        return round;
    }

    private static calculate_time(round: MPRound): number {
        return Date.now() - round.started_at;
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
    export type IdleData = {
        created_at: number;
        last_updated: number;
        timeout: NodeJS.Timeout | null;
    };

    export const Event = {
        GAME_STATE_CHANGE: "game_state_change"
    };
}