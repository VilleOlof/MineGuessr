import { Elysia } from 'elysia';

import { ws_route } from "./src/websocket_handler";
import { GameHandler } from 'src/game_handler';
import { Payloads, request_type } from '../shared/MP';
import { ROUNDS_PER_MATCH } from '../shared';
import { MPGame } from 'src/mp-game';

function get_game_label(game_id: string) {
    return `game_${game_id}`;
}

function Main() {
    const PORT = Bun.env.PORT || 3000;

    // new Elysia()
    //     .use(ws_route)
    //     .get('/', () => {
    //         return new Response("OK", { status: 200 });
    //     })
    //     .listen(PORT)

    const server = Bun.serve({
        port: PORT,
        fetch(request, server) {

            if (server.upgrade(request)) {
                return;
            }

            return new Response("OK", { status: 200 });
        },
        websocket: {
            message(ws, message) {
                // switch (data.type) {
                //     case request_type.PING: {
                //         ws.send(JSON.stringify({
                //             type: request_type.PING,
                //             _payload: {}
                //         }));
                //         break;
                //     }
                // }

                //TODO: Tidy this up

                try {
                    if (message instanceof Buffer) {
                        return;
                    }
                    const unsafe_data = JSON.parse(message);
                    const data_result = GameHandler.message.safeParse(unsafe_data);

                    if (!data_result.success) {
                        ws.send(JSON.stringify({
                            type: request_type.ERROR,
                            _payload: {
                                reason: `Invalid message: ${data_result.error.message}`
                            } as Payloads.Error
                        }));

                        return;
                    }

                    const { type, _payload, player_id, game_id } = data_result.data;

                    switch (type) {
                        case request_type.CREATE_GAME: {
                            const payload = _payload as Payloads.CreateGame;

                            const new_game_id = GameHandler.create_game(player_id, payload);

                            ws.send(JSON.stringify({
                                type: request_type.JOINED_GAME,
                                payload: {
                                    game_id: new_game_id,
                                    players: [{ player_id, ready: false }]
                                } as Payloads.JoinedGame
                            }));

                            ws.subscribe(get_game_label(new_game_id));

                            break;
                        }
                        case request_type.JOIN_GAME: {
                            const payload = _payload as Payloads.JoinGame;

                            const game = GameHandler.join_game(player_id, payload);

                            const game_label = get_game_label(payload.game_id);

                            server.publish(game_label, JSON.stringify({
                                type: request_type.OTHER_PLAYER_JOINED,
                                payload: { player_id } as Payloads.OtherPlayerJoined
                            }));

                            ws.send(JSON.stringify({
                                type: request_type.JOINED_GAME,
                                payload: {
                                    game_id: payload.game_id,
                                    players: Object.keys(game.players).map(player_id => ({ player_id, ready: game.players[player_id].lobby_ready }))
                                } as Payloads.JoinedGame
                            }));

                            ws.subscribe(game_label);

                            break;
                        }
                        case request_type.CHANGE_READY_STATUS: {
                            const payload = _payload as Payloads.ChangeReadyStatus;

                            if (!game_id) {
                                throw new Error("No game_id provided");
                            }

                            const game_started = GameHandler.ready(player_id, game_id, payload.ready);
                            const game = GameHandler.games[game_id];

                            server.publish(get_game_label(game_id), JSON.stringify({
                                type: request_type.OTHER_PLAYER_READY,
                                payload: {
                                    player_id,
                                    ready: payload.ready
                                } as Payloads.OtherPlayerReady
                            }));

                            if (game_started) {
                                const game_data = JSON.stringify({
                                    type: request_type.NEXT_ROUND,
                                    payload: {
                                        panorama_id: game.get_current_panorama_data().id,
                                        round_index: game.current_round
                                    } as Payloads.NextRound
                                });

                                // For the user who sent the final ready status
                                // ws.send(game_data);
                                // For everyone else
                                server.publish(get_game_label(game_id), game_data);
                            }

                            break;
                        }
                        case request_type.GUESS_LOCATION: {
                            const payload = _payload as Payloads.GuessLocation;

                            if (!game_id) {
                                throw new Error("No game_id provided");
                            }

                            const game = GameHandler.games[game_id];
                            game.guess_location(player_id, payload.location);

                            server.publish(get_game_label(game_id), JSON.stringify({
                                type: request_type.OTHER_PLAYER_GUESSED,
                                payload: {
                                    player_id,
                                } as Payloads.OtherPlayerGuessed
                            }));

                            if (game.all_players_guessed()) {
                                if (game.current_round + 1 === ROUNDS_PER_MATCH) {
                                    GameHandler.end_game(game_id);

                                    const game_data = JSON.stringify({
                                        type: request_type.GAME_FINISHED,
                                        payload: {
                                            players: game.get_all_players_data()
                                        } as Payloads.GameFinished
                                    });

                                    server.publish(get_game_label(game_id), game_data);
                                    // ws.send(game_data);

                                    return;
                                }

                                const game_data = JSON.stringify({
                                    type: request_type.ROUND_ENDED,
                                    payload: {
                                        rounds: game.get_players_round_data()
                                    } as Payloads.RoundEnded
                                });

                                // For the user who sent the final guess
                                // ws.send(game_data);
                                // For everyone else
                                server.publish(get_game_label(game_id), game_data);

                                if (game.inbetween_round_timeout) clearTimeout(game.inbetween_round_timeout);
                                game.inbetween_round_timeout = setTimeout(() => {
                                    game.next_round();

                                    const game_data = JSON.stringify({
                                        type: request_type.NEXT_ROUND,
                                        payload: {
                                            panorama_id: game.get_current_panorama_data().id,
                                            round_index: game.current_round
                                        } as Payloads.NextRound
                                    });

                                    server.publish(get_game_label(game_id), game_data);
                                    // ws.send(game_data);
                                }, MPGame.inbetween_round_time);
                            }

                            break;
                        }
                        case request_type.GOTO_NEXT_ROUND: {
                            if (!game_id) {
                                throw new Error("No game_id provided");
                            }

                            const game = GameHandler.games[game_id];
                            game.ready_for_next_round(player_id);

                            if (game.all_players_ready_for_next_round()) {
                                game.next_round();

                                const game_data = JSON.stringify({
                                    type: request_type.NEXT_ROUND,
                                    payload: {
                                        panorama_id: game.get_current_panorama_data().id,
                                        round_index: game.current_round
                                    } as Payloads.NextRound
                                });

                                // For the user who sent the final ready status
                                // ws.send(game_data);
                                // For everyone else
                                server.publish(get_game_label(game_id), game_data);
                            }

                            break;
                        }
                        case request_type.PING: {
                            // TODO: timeout when the game starts for some reason
                            // ping(ws, player_id);

                            break;
                        }
                        // TODO: handle client aborted message
                    }
                }
                catch (e) {
                    if (e instanceof Error) {
                        ws.send(JSON.stringify({ type: request_type.ERROR, payload: e.message }));
                    }
                }

            },
            open(ws) {

            },
        }
    });

    console.log(`MP server started on port ${server.port}!`);
}

Main();