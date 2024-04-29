import { MPGame } from "./mp-game";
import { Lobby, Payloads, Visibility, request_type } from "../../shared/MP";
import { z } from "zod";
import { random_game_name } from "./random_game_name";

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
        const previous_game = get_game_player_is_in(player);
        if (previous_game !== null) {
            // Leave the old one
            if (previous_game) {
                previous_game.remove_player(player);
            }

            console.log(`Player ${player} left game ${previous_game?.game_id ?? "unknown"} due to creating a new game`);
        }

        let game = new MPGame(payload.panoramas);
        game.config.visibility = payload.visibility;

        if (payload.game_name) game.config.game_name = payload.game_name;
        else game.config.game_name = random_game_name();

        if (payload.player_limit < MPGame.MIN_PLAYERS) {
            throw new Error("Player limit is too low");
        }
        game.config.player_limit = payload.player_limit ?? MPGame.MIN_PLAYERS;

        game.add_player(player);
        game.set_game_creator(player);

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

    export function get_open_lobbies() {
        const lobbies: Lobby[] = [];

        for (let game_id in games) {
            const game = games[game_id];

            if (game.config.visibility === Visibility.PUBLIC) {
                lobbies.push({
                    players: Object.keys(game.players).map(player_id => {
                        return {
                            player_id,
                            discord: game.players[player_id].discord,
                            ready: game.players[player_id].lobby_ready // Rename to ready from lobby_ready??
                        };
                    }),
                    game_id,
                    game_name: game.config.game_name,
                    player_limit: game.config.player_limit
                });
            }
        }

        return lobbies;
    }
}