import { Server, ServerWebSocket } from "bun";
import { message_handlers } from "./websocket_handler";
import { request_type } from "../../shared/MP";
import { WebSocketData } from "index";

export module Ping {
    export const INTERVAL = 1000 * 8;
    export const RESPONSE_MAX = 1000 * 2;

    export let timeouts: { [key: string]: NodeJS.Timeout } = {};
    export let user_games: { [key: string]: { game_id: string, player_id: string } } = {};

    export function send(ws: ServerWebSocket<WebSocketData>, server: Server) {
        ws.send(JSON.stringify({
            type: 14,
            payload: {}
        }));

        // console.log(`Sent ping to ${ws.remoteAddress}`);

        const timeout = setTimeout(() => {
            console.log(`Client ${ws.remoteAddress} timed out`);
            const { game_id, player_id } = user_games[ws.data.uuid] ?? {} as { game_id: string, player_id: string };

            if (game_id && player_id) {
                // @ts-ignore
                message_handlers.get(request_type.LEAVE_GAME)!(ws, server, { game_id, player_id });
            }

            delete user_games[ws.data.uuid];

            ws.close();
        }, RESPONSE_MAX);

        timeouts[ws.data.uuid] = timeout;
    }

    export function handle(ws: ServerWebSocket<WebSocketData>, server: Server) {
        if (timeouts[ws.data.uuid]) {
            clearTimeout(timeouts[ws.data.uuid]);
            delete timeouts[ws.data.uuid];
        }

        // console.log(`Received pong from ${ws.remoteAddress}`);

        setTimeout(() => {
            send(ws, server);
        }, INTERVAL);
    }
}