import { GameHandler } from 'src/game_handler';
import { Payloads, WebsocketRequest, request_type } from '../shared/MP';
import { ROUNDS_PER_MATCH } from '../shared';
import { MPGame } from 'src/mp-game';
import { Server, ServerWebSocket } from 'bun';

function get_game_label(game_id: string) {
    return `game_${game_id}`;
}

function ws_next_round(game: MPGame, server: Server) {
    game.next_round();

    const game_data = JSON.stringify({
        type: request_type.NEXT_ROUND,
        payload: {
            panorama_id: game.get_current_panorama_data().id,
            round_index: game.current_round
        } as Payloads.NextRound
    });

    server.publish(get_game_label(game.game_id), game_data);
}

const message_handlers = new Map<request_type, (ws: ServerWebSocket<unknown>, server: Server, message: WebsocketRequest) => void>([
    [request_type.CREATE_GAME, (ws, _, { _payload, player_id }) => {
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
    }],
    [request_type.JOIN_GAME, (ws, server, { _payload, player_id }) => {
        const payload = _payload as Payloads.JoinGame;

        const game = GameHandler.join_game(player_id, payload);

        const game_label = get_game_label(payload.game_id);

        server.publish(game_label, JSON.stringify({
            type: request_type.OTHER_PLAYER_JOINED,
            payload: { player_id } as Payloads.OtherPlayerJoined
        }));

        const players = Object
            .keys(game.players)
            .map(player_id => ({
                player_id,
                ready: game.players[player_id].lobby_ready
            }));

        ws.send(JSON.stringify({
            type: request_type.JOINED_GAME,
            payload: {
                game_id: payload.game_id,
                players
            } as Payloads.JoinedGame
        }));

        ws.subscribe(game_label);
    }],
    [request_type.CHANGE_READY_STATUS, (_, server, { _payload, player_id, game_id }) => {
        const payload = _payload as Payloads.ChangeReadyStatus;

        if (!game_id) throw new Error("No game_id provided");

        const game_started = GameHandler.ready(player_id, game_id, payload.ready);
        const game_label = get_game_label(game_id);

        server.publish(game_label, JSON.stringify({
            type: request_type.OTHER_PLAYER_READY,
            payload: {
                player_id,
                ready: payload.ready
            } as Payloads.OtherPlayerReady
        }));

        if (!game_started) return;
        const game = GameHandler.games[game_id];

        server.publish(game_label, JSON.stringify({
            type: request_type.NEXT_ROUND,
            payload: {
                panorama_id: game.get_current_panorama_data().id,
                round_index: game.current_round
            } as Payloads.NextRound
        }));
    }],
    [request_type.GUESS_LOCATION, (_, server, { _payload, player_id, game_id }) => {
        const payload = _payload as Payloads.GuessLocation;

        if (!game_id) throw new Error("No game_id provided");

        const game = GameHandler.games[game_id];
        const game_label = get_game_label(game_id);
        game.guess_location(player_id, payload.location);

        server.publish(game_label, JSON.stringify({
            type: request_type.OTHER_PLAYER_GUESSED,
            payload: {
                player_id,
            } as Payloads.OtherPlayerGuessed
        }));

        // Give a time limit if one player has guessed
        if (!game.guess_timeout) {
            game.guess_timeout = setTimeout(() => {
                const game_data = JSON.stringify({
                    type: request_type.ROUND_ENDED,
                    payload: {
                        rounds: game.get_players_round_data()
                    } as Payloads.RoundEnded
                });

                server.publish(game_label, game_data);
            }, MPGame.guess_timeout);
        }

        if (game.inbetween_round_timeout) clearTimeout(game.inbetween_round_timeout);

        if (game.all_players_guessed()) {
            if (game.current_round + 1 === ROUNDS_PER_MATCH) {
                GameHandler.end_game(game_id);

                const game_data = JSON.stringify({
                    type: request_type.GAME_FINISHED,
                    payload: {
                        players: game.get_all_players_data()
                    } as Payloads.GameFinished
                });

                server.publish(game_label, game_data);

                return;
            }

            const game_data = JSON.stringify({
                type: request_type.ROUND_ENDED,
                payload: {
                    rounds: game.get_players_round_data()
                } as Payloads.RoundEnded
            });

            server.publish(game_label, game_data);

            // Auto-start after a while
            game.inbetween_round_timeout = setTimeout(
                () => ws_next_round(game, server),
                MPGame.inbetween_round_time
            );

            return;
        }
    }],
    [request_type.GOTO_NEXT_ROUND, (_, server, { player_id, game_id }) => {
        if (!game_id) throw new Error("No game_id provided");

        const game = GameHandler.games[game_id];
        game.ready_for_next_round(player_id);

        if (!game.all_players_ready_for_next_round()) return;
        ws_next_round(game, server);
    }],
    [request_type.PING, (ws) => {
        ws.send(JSON.stringify({ type: request_type.PING, payload: {} }));
    }]
]);


function Main() {
    const PORT = Bun.env.PORT || 3000;

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
                            payload: {
                                reason: `Invalid message: ${data_result.error.message}`
                            } as Payloads.Error
                        }));

                        return;
                    }

                    const { type, _payload, player_id, game_id } = data_result.data;

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
                    handler(ws, server, { type, _payload, player_id, game_id });
                }
                catch (e) {
                    if (e instanceof Error) {
                        console.error(e);
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