import { t } from "elysia";
import { MPGame } from "./mp-game";
import { Visibility, request_type } from "../../shared/MP";
import { location_metadata } from "../../shared";

export module GameHandler {
    export let games: MPGame[] = [];

    export const message_schema = t.Object({
        type: t.Enum(request_type),
        player_id: t.String(),
        _payload: t.Unknown()
    });

    // TODO: Make these into schemas and validate?
    export module Payloads {
        export type CreateGame = {
            panoramas: location_metadata[],
            visibility: Visibility
        }
    }

    function does_player_have_game(player: string) {
        return games.find(game => Object.keys(game.players).includes(player));
    }

    export function create_game(player: string, payload: Payloads.CreateGame) {
        if (does_player_have_game(player)) {
            throw new Error("Player already has a game");
        }

        let game = new MPGame(payload.panoramas);
        game.config.visibility = payload.visibility;
        game.add_player(player);

        games.push(game);

        console.log(`Game created by ${player} | Game ID: ${game.game_id}`);
    }
}