import { GameHandler } from 'src/game_handler';
import { Payloads, PlayerLobbyData, WebsocketRequest, request_type } from '../../shared/MP';
import { ROUNDS_PER_MATCH } from '../../shared';
import { MPGame } from 'src/mp-game';
import { Server, ServerWebSocket } from 'bun';
import { WebSocketData } from 'index';
import { Ping } from './ping';
import { get_user } from './auth';

function get_game_label(game_id: string) {
    return `game_${game_id}`;
}

function ws_next_round(game: MPGame, server: Server, request_round?: number) {
    // If the user requests round is different than the game, dont continue
    if (request_round && game.current_round !== request_round) {
        return;
    }

    game.next_round();

    const game_data = JSON.stringify({
        type: request_type.NEXT_ROUND,
        payload: {
            panorama_id: game.get_current_panorama_data().id,
            round_index: game.current_round
        } as Payloads.NextRound
    });

    server.publish(get_game_label(game.game_id), game_data);

    ws_log(game.game_id, "server", `started next round [${game.current_round + 1}]`);
}

function ws_log(game_id: string, player_id: string, msg: string) {
    console.log(`[${game_id}, ${player_id}] ${msg}`);
}

export const message_handlers = new Map<request_type, (ws: ServerWebSocket<WebSocketData>, server: Server, message: WebsocketRequest) => void>([
    [request_type.CREATE_GAME, (ws, server, { _payload, player_id }) => {
        const payload = _payload as Payloads.CreateGame;

        const new_game_id = GameHandler.create_game(player_id, payload);
        const game = GameHandler.games[new_game_id];

        const user_data = get_user(player_id);
        if (!user_data) throw new Error(`User ${player_id} does not exist`);

        ws.send(JSON.stringify({
            type: request_type.JOINED_GAME,
            payload: {
                game_id: new_game_id,
                players: [{
                    player_id,
                    discord: {
                        user_id: user_data.user_id,
                        username: user_data.username,
                        avatar: user_data.avatar
                    },
                    ready: false
                }],
                visibility: payload.visibility,
                game_name: game.config.game_name,
                player_limit: payload.player_limit
            } as Payloads.JoinedGame
        }));

        Ping.user_games[ws.data.uuid] = { game_id: new_game_id, player_id };

        ws_log(new_game_id, player_id, "created new game");

        ws.subscribe(get_game_label(new_game_id));

        MPGame.MPEvents.on(MPGame.get_event_name(MPGame.Event.GAME_STATE_CHANGE, new_game_id), ({ state, game_id }) => {
            switch (state) {
                case "intermission": {
                    const game = GameHandler.games[game_id];
                    const game_label = get_game_label(game_id);

                    if (game.inbetween_round_timeout === null) {
                        // Auto-start after a while
                        game.inbetween_round_timeout = setTimeout(
                            () => {
                                ws_next_round(game, server);
                                game.inbetween_round_timeout = null;
                            },
                            MPGame.inbetween_round_time
                        );
                        server.publish(game_label, JSON.stringify({
                            type: request_type.GOTO_NEXT_ROUND_TIMELIMIT,
                            payload: { time: MPGame.inbetween_round_time } as Payloads.GotoNextRoundTimelimit
                        }));
                    }

                    break;
                }
                case "aborted": {
                    const game = GameHandler.games[game_id];
                    if (game) game.self_destruct();
                    else {
                        console.error(`Game ${game_id} was aborted but does not exist`);
                        return;
                    }

                    const game_label = get_game_label(game_id);
                    server.publish(game_label, JSON.stringify({
                        type: request_type.ABORTED,
                        payload: { reason: "Game was aborted" } as Payloads.Aborted
                    }));

                    break;
                }
            }
        })
    }],
    [request_type.JOIN_GAME, (ws, server, { _payload, player_id }) => {
        const payload = _payload as Payloads.JoinGame;

        const game = GameHandler.join_game(player_id, payload);

        Ping.user_games[ws.data.uuid] = { game_id: payload.game_id, player_id };

        const game_label = get_game_label(payload.game_id);

        server.publish(game_label, JSON.stringify({
            type: request_type.OTHER_PLAYER_JOINED,
            payload: {
                player_id,
                discord: game.players[player_id].discord
            } as Payloads.OtherPlayerJoined
        }));

        ws_log(payload.game_id, player_id, "joined game");

        const players: PlayerLobbyData[] = Object
            .keys(game.players)
            .map(player_id => ({
                player_id,
                discord: game.players[player_id].discord,
                ready: game.players[player_id].lobby_ready
            }));

        ws.send(JSON.stringify({
            type: request_type.JOINED_GAME,
            payload: {
                game_id: payload.game_id,
                players,
                visibility: game.config.visibility,
                game_name: game.config.game_name,
                player_limit: game.config.player_limit
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

        ws_log(game_id, player_id, `set ready status to ${payload.ready}`);

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
    [request_type.GUESS_LOCATION, (ws, server, { _payload, player_id, game_id }) => {
        const payload = _payload as Payloads.GuessLocation;

        if (!game_id) throw new Error("No game_id provided");

        const game = GameHandler.games[game_id];
        if (!game) throw new Error(`Game ${game_id} does not exist`);

        if (payload.round_index !== game.current_round) {
            throw new Error("Guessed in wrong round");
        }

        const game_label = get_game_label(game_id);
        game.guess_location(player_id, payload.location);

        server.publish(game_label, JSON.stringify({
            type: request_type.OTHER_PLAYER_GUESSED,
            payload: {
                player_id,
            } as Payloads.OtherPlayerGuessed
        }));

        ws_log(game_id, player_id, `guessed at ${payload.location.x}, ${payload.location.y}`);

        // Give a time limit if one player has guessed
        if (game.guess_timeout === null) {
            game.guess_timeout = setTimeout(() => {
                const game_data = JSON.stringify({
                    type: request_type.ROUND_ENDED,
                    payload: {
                        rounds: game.get_players_round_data()
                    } as Payloads.RoundEnded
                });
                game.state = "intermission";

                server.publish(game_label, game_data);

                game.guess_timeout = null;
            }, MPGame.guess_timeout);

            server.publish(game_label, JSON.stringify({
                type: request_type.ROUND_TIMELIMIT,
                payload: { time: MPGame.guess_timeout } as Payloads.RoundTimelimit
            }));
        }

        if (game.inbetween_round_timeout !== null) {
            clearTimeout(game.inbetween_round_timeout);
            game.inbetween_round_timeout = null;
        }

        if (game.all_players_guessed()) {
            ws_log(game_id, player_id, "all players guessed");

            const game_data = JSON.stringify({
                type: request_type.ROUND_ENDED,
                payload: {
                    rounds: game.get_players_round_data()
                } as Payloads.RoundEnded
            });
            game.state = "intermission";

            server.publish(game_label, game_data);

            return;
        }
    }],
    [request_type.GOTO_NEXT_ROUND, (ws, server, { player_id, game_id, _payload }) => {
        const payload = _payload as Payloads.GotoNextRound;

        if (!game_id) throw new Error("No game_id provided");

        const game = GameHandler.games[game_id];
        if (!game) throw new Error(`Game ${game_id} does not exist`);

        if (payload.round_index !== game.current_round) {
            throw new Error("Tried to go to next round in wrong round");
        }

        game.ready_for_next_round(player_id);

        server.publish(get_game_label(game_id), JSON.stringify({
            type: request_type.OTHER_PLAYER_NEXT_ROUND,
            payload: { player_id } as Payloads.OtherPlayerNextRound
        }));

        ws_log(game_id, player_id, "ready for next round");

        if (!game.all_players_ready_for_next_round()) return;

        // Clear guess timeout if all players go to next round
        if (game.guess_timeout) {
            clearTimeout(game.guess_timeout);
            game.guess_timeout = null;
        }

        if (game.current_round + 1 === ROUNDS_PER_MATCH) {
            const game_label = get_game_label(game_id);
            GameHandler.end_game(game_id);

            const game_data = JSON.stringify({
                type: request_type.GAME_FINISHED,
                payload: {
                    players: game.get_all_players_data()
                } as Payloads.GameFinished
            });

            ws_log(game_id, player_id, "game finished");

            server.publish(game_label, game_data);

            // Clean up
            game.self_destruct();
            delete Ping.user_games[ws.data.uuid];

            return;
        }

        ws_next_round(game, server, payload.round_index);
    }],
    [request_type.PING, (ws, server) => {
        Ping.handle(ws, server);
    }],
    [request_type.LEAVE_GAME, (ws, server, { game_id, player_id }) => {
        if (!game_id) throw new Error("No game_id provided");

        const game = GameHandler.games[game_id];
        if (!game) throw new Error(`Game ${game_id} does not exist`);
        const game_label = get_game_label(game_id);

        server.publish(game_label, JSON.stringify({
            type: request_type.OTHER_PLAYER_LEFT,
            payload: { player_id } as Payloads.OtherPlayerLeft
        }));

        ws.unsubscribe(game_label);

        ws_log(game_id, player_id, "left game");

        game.remove_player(player_id);
        delete Ping.user_games[ws.data.uuid];
    }]
]);