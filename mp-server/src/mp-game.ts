import { GameModule } from "../../shared/GameModule";
import * as THREE from "three";
import { ROUNDS_PER_MATCH, location_metadata } from "../../shared";
import { Config } from "../../shared/MP";

export module MPGame {
    export type State = "lobby" | "playing" | "finished" | "aborted" | "error";

    export type MPRound = GameModule.Round & {
        ready_for_next: boolean;
    }
}

export class MPGame {
    private static PLAYER_LIMIT: number = 2;

    public state: MPGame.State = "lobby";
    public config: Config = {
        panoramas: [],
        visibility: "private"
    };
    public game_id: string;

    public players: {
        [key: string]: {
            rounds: GameModule.Round[];
            lobby_ready: boolean;
        }
    } = {};

    public constructor(panoramas: location_metadata[]) {
        this.state = "lobby";
        this.config.panoramas = panoramas;

        this.game_id = MPGame.generate_game_id();
    }

    public add_player(player: string) {
        if (Object.keys(this.players).length >= MPGame.PLAYER_LIMIT) {
            throw new Error("Game is full");
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
                panorama_id: this.config.panoramas[i].id
            });
        }
    }

    private static generate_game_id() {
        let id = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (let i = 0; i < 6; i++) {
            id += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return id;
    }
}