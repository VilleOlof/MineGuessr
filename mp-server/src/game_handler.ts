import { MPGame } from "./mp-game";
import { Payloads, request_type } from "../../shared/MP";
import { z } from "zod";

export module GameHandler {
    export let games: { [game_id: string]: MPGame } = {};

    export const message = z.object({
        type: z.nativeEnum(request_type),
        player_id: z.string(),
        _payload: z.unknown(),
        game_id: z.string().optional(),
        auth_session: z.string()
    });

    function does_player_have_game(player: string) {
        for (let game_id in games) {
            if (games[game_id].players[player]) {
                return true;
            }
        }

        return false;
    }

    export function get_game_player_is_in(player: string) {
        for (let game_id in games) {
            if (games[game_id].players[player]) {
                return games[game_id];
            }
        }

        return null;
    }

    export function create_game(player: string, payload: Payloads.CreateGame) {
        if (does_player_have_game(player)) throw new Error("Player already has a game");

        let game = new MPGame(payload.panoramas);
        game.config.visibility = payload.visibility;
        game.add_player(player);

        games[game.game_id] = game;

        return game.game_id;
    }

    export function join_game(player: string, payload: Payloads.JoinGame) {
        if (!games[payload.game_id]) throw new Error("Game does not exist");

        if (does_player_have_game(player)) throw new Error("Player already has a game");

        games[payload.game_id].add_player(player);

        return games[payload.game_id];
    }

    export function ready(player: string, game_id: string, ready: boolean) {
        const game = games[game_id];

        if (!game) throw new Error("Game does not exist");
        if (!game.players[player]) throw new Error("Player is not in game");

        game.players[player].lobby_ready = ready;

        const all_ready = game.all_players_ready();
        if (all_ready) game.start_game();

        return all_ready;
    }

    export function end_game(game_id: string) {
        const game = games[game_id];

        if (!game) throw new Error("Game does not exist");

        game.state = "finished";

        console.log(`Game ${game_id} ended`);
    }
}