import { GameHandler } from 'src/game_handler';
import { Payloads, request_type } from '../shared/MP';
import { PING_TIMEOUT, message_handlers } from 'src/websocket_handler';
import { db_session_valid_call, get_auth_string, ws_authed_users } from 'src/auth';
import { route_handlers } from 'src/route_handler';
import { uuidv4 } from '../shared';

export type WebSocketData = {
    uuid: string;
}

// TODO: add route that is in the mp page, to get lobbies and auto-refresh. /menu
function Main() {
    const PORT = Bun.env.PORT || 3000;

    const server = Bun.serve<WebSocketData>({
        port: PORT,
        fetch(request, server) {

            // Upgrade to websocket
            if (server.upgrade(request, {
                data: {
                    uuid: uuidv4()
                },
            })) {
                return;
            }

            const path = new URL(request.url).pathname;
            console.log(`Received request: ${path}`);

            const handler = route_handlers.get(path);
            if (handler === undefined) {
                return new Response("Not found", { status: 404 });
            }

            return handler(request, server);
        },
        websocket: {
            idleTimeout: (PING_TIMEOUT * 1.5) / 1000, // Milliseconds to seconds
            message(ws, message) {
                try {
                    if (message instanceof Buffer) {
                        return;
                    }
                    const unsafe_data = JSON.parse(message);
                    const data_result = GameHandler.message.safeParse(unsafe_data);

                    if (!data_result.success) {
                        ws.send(JSON.stringify({
                            type: request_type.ERROR,
                            payload: {
                                reason: `Invalid message: ${data_result.error.message}`
                            } as Payloads.Error
                        }));
                        console.error(`Failed to parse message: ${data_result.error}`);

                        return;
                    }

                    const { type, _payload, player_id, game_id, auth_session } = data_result.data;


                    if (!ws_authed_users[get_auth_string(player_id, auth_session)]) {
                        const is_dev = Bun.env.DEV === "true";

                        const { success, player_id: db_player_id } = db_session_valid_call(auth_session);
                        if (!success) {
                            ws.send(JSON.stringify({
                                type: request_type.ERROR,
                                payload: {
                                    reason: "Invalid auth session"
                                } as Payloads.Error
                            }));

                            ws.close();

                            return;
                        }
                        if (player_id !== db_player_id && !is_dev) {
                            ws.send(JSON.stringify({
                                type: request_type.ERROR,
                                payload: {
                                    reason: "Player ID does not match auth session"
                                } as Payloads.Error
                            }));

                            ws.close();

                            return;
                        }

                        ws_authed_users[get_auth_string(player_id, auth_session)] = true;
                        console.log(`Player ${player_id} authenticated`);
                    }

                    const handler = message_handlers.get(type);
                    if (handler === undefined) {
                        ws.send(JSON.stringify({
                            type: request_type.ERROR,
                            payload: {
                                reason: `Invalid message type: ${type}`
                            } as Payloads.Error

                        }));

                        return;
                    }

                    // Passing just 'data' results in it thinking _payload is optional. This is a workaround
                    handler(ws, server, { type, _payload, player_id, game_id, auth_session });
                }
                catch (e) {
                    if (e instanceof Error) {
                        console.error(e);
                        ws.send(JSON.stringify({ type: request_type.ERROR, payload: { reason: e.message } }));
                    }
                }

            },
            open(ws) {
                console.log(`New client connected: ${ws.remoteAddress}`);
            },
            close(ws) {
                console.log(`Client disconnected: ${ws.remoteAddress}`);
            }
        }
    });

    console.log(`MP server started on port ${server.port}!`);
}

Main();