import { Elysia, t } from "elysia";
import { auth_plugin } from "./auth";
import { GameHandler } from "./game_handler";
import { Payloads, request_type } from "../../shared/MP";
import { MPGame } from "./mp-game";
import { ROUNDS_PER_MATCH } from "../../shared";

function get_game_label(game_id: string) {
    return `game_${game_id}`;
}

const PING_TIMEOUT = 1000 * 15;
let ws_ping_timeouts: { [key: string]: NodeJS.Timeout } = {};

function ping(ws: any, player_id: string) {
    ws.send(JSON.stringify({ type: request_type.PING, payload: {} }));

    if (ws_ping_timeouts[player_id]) {
        clearTimeout(ws_ping_timeouts[player_id]);
    }

    ws_ping_timeouts[player_id] = setTimeout(() => {
        const game = GameHandler.get_game_player_is_in(player_id);

        if (game) {
            game.state = "aborted";

            ws.publish(get_game_label(game.game_id), JSON.stringify({
                type: request_type.ABORTED,
                payload: { reason: "Ping timeout" } as Payloads.Aborted
            }));

            ws.send(JSON.stringify({
                type: request_type.ABORTED,
                payload: { reason: "Ping timeout" } as Payloads.Aborted
            }));

            delete ws_ping_timeouts[player_id];
            delete GameHandler.games[game.game_id];

            console.log(`Game ${game.game_id} aborted due to ping timeout`);
        }

        ws.close();

    }, PING_TIMEOUT);
}

// TODO: try .publish and server.publish via Bun and maybe just ditch Elysia
export const ws_route = new Elysia({ prefix: '/ws' })
    .use(auth_plugin)
    .ws('/game', {
        beforeHandle({ auth }) {
            if (!auth) return new Response('Unauthorized', { status: 401 });
        },
        body: GameHandler.message_schema,
        message(ws, { type, player_id, _payload, game_id }) {
            try {
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

                        ws.publish(game_label, JSON.stringify({
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

                        ws.publish(get_game_label(game_id), JSON.stringify({
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
                            ws.send(game_data);
                            // For everyone else
                            ws.publish(get_game_label(game_id), game_data);
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

                        ws.publish(get_game_label(game_id), JSON.stringify({
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

                                ws.publish(get_game_label(game_id), game_data);
                                ws.send(game_data);

                                return;
                            }

                            const game_data = JSON.stringify({
                                type: request_type.ROUND_ENDED,
                                payload: {
                                    rounds: game.get_players_round_data()
                                } as Payloads.RoundEnded
                            });

                            // For the user who sent the final guess
                            ws.send(game_data);
                            // For everyone else
                            ws.publish(get_game_label(game_id), game_data);

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

                                ws.publish(get_game_label(game_id), game_data);
                                ws.send(game_data);
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
                            ws.send(game_data);
                            // For everyone else
                            ws.publish(get_game_label(game_id), game_data);
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
            // console.log(ws.data, ws.remoteAddress);
        },
        close(ws) {
        }
    })
// TODO: add route that is in the mp page, to get lobbies and auto-refresh. /menu