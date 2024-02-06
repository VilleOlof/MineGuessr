import { Elysia, t } from "elysia";
import { auth_plugin } from "./auth";
import { GameHandler } from "./game_handler";
import { request_type } from "../../shared/MP";

export const ws_route = new Elysia({ prefix: '/ws' })
    .use(auth_plugin)
    .ws('/game', {
        beforeHandle({ auth }) {
            if (!auth) return new Response('Unauthorized', { status: 401 });
        },
        body: GameHandler.message_schema,
        message(ws, { type, player_id, _payload }) {
            try {
                switch (type) {
                    case request_type.CREATE_GAME: {
                        const payload = _payload as GameHandler.Payloads.CreateGame;

                        GameHandler.create_game(player_id, payload);
                        // ? // ws.send(JSON.stringify({ type: request_type.CREATE_GAME, payload: "success" }));

                        break;
                    }
                }
            }
            catch (e) {
                if (e instanceof Error) {
                    ws.send(JSON.stringify({ type: request_type.ERROR, payload: e.message }));
                }
            }
        }
    })
// TODO: add route that is in the mp page, to get lobbies and auto-refresh. /menu