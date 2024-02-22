import { MP_DEV, MP_URL } from "$env/static/private";
import type { location_metadata } from "../../../shared";
import { Visibility, get_request_type_name, request_type, type Lobby, type Payloads, type ServerResponse, type WebsocketRequest } from "../../../shared/MP";
import * as THREE from "three";

export class MPClient {
    private ws: WebSocket;

    private metadata: MPClient.Metadata;
    public client_debug: boolean = true;

    constructor(user_id: string, auth: string) {
        this.ws = new WebSocket(MPClient.WS_URL);

        this.metadata = {
            player_id: user_id,
            game_id: undefined,
            auth_session: auth
        };

        this.setup_message_handler();
        this.setup_error_handler();
    }

    private send_message(type: request_type, payload: Payloads.Any) {
        this.ws.send(JSON.stringify({
            type,
            player_id: this.metadata.player_id,
            _payload: payload,
            game_id: this.metadata.game_id,
            auth_session: this.metadata.auth_session
        } as WebsocketRequest));

        if (this.client_debug) {
            console.debug(`Sent message: ${get_request_type_name(type)}`);
        }
    }

    private setup_message_handler() {
        this.ws.onmessage = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data) as ServerResponse;

                const handler = this.message_handler.get(data.type);
                if (handler) {
                    handler(data);
                }
                else {
                    console.error(`No handler for message type: ${get_request_type_name(data.type)}`);
                }
            }
            catch (e) {
                console.error(`Failed to parse message: ${e}`);
            }
        }
    }

    private setup_error_handler() {
        this.ws.onerror = (event: Event) => {
            console.error(event);
        }
    }

    public create_game(panoramas: location_metadata[], visibility: Visibility) {
        this.send_message(request_type.CREATE_GAME, {
            panoramas, visibility
        } as Payloads.CreateGame);
    }

    public join_game(game_id: string) {
        this.send_message(request_type.JOIN_GAME, {
            game_id
        } as Payloads.JoinGame);
    }

    public leave_game() {
        this.send_message(request_type.LEAVE_GAME, {});
    }

    public change_ready_status(ready: boolean) {
        this.send_message(request_type.CHANGE_READY_STATUS, {
            ready
        } as Payloads.ChangeReadyStatus);
    }

    public guess_location(location: THREE.Vector2) {
        this.send_message(request_type.GUESS_LOCATION, {
            location
        } as Payloads.GuessLocation);
    }

    public next_round() {
        this.send_message(request_type.GOTO_NEXT_ROUND, {});
    }

    // TODO: Implement these
    private message_handler: Map<request_type, (data: ServerResponse) => void> = new Map([
        [request_type.JOINED_GAME, (data) => {
            throw new Error("Not implemented");
        }],
        [request_type.OTHER_PLAYER_JOINED, (data) => {
            throw new Error("Not implemented");
        }],
        [request_type.OTHER_PLAYER_READY, (data) => {
            throw new Error("Not implemented");
        }],
        [request_type.NEXT_ROUND, (data) => {
            throw new Error("Not implemented");
        }],
        [request_type.OTHER_PLAYER_GUESSED, (data) => {
            throw new Error("Not implemented");
        }],
        [request_type.ROUND_ENDED, (data) => {
            throw new Error("Not implemented");
        }],
        [request_type.GAME_FINISHED, (data) => {
            throw new Error("Not implemented");
        }],
        [request_type.ABORTED, (data) => {
            throw new Error("Not implemented");
        }],
        [request_type.ERROR, (data) => {
            throw new Error("Not implemented");
        }],
        [request_type.PING, (data) => {
            throw new Error("Not implemented");
        }],
        [request_type.ROUND_TIMELIMIT, (data) => {
            throw new Error("Not implemented");
        }],
        [request_type.GOTO_NEXT_ROUND_TIMELIMIT, (data) => {
            throw new Error("Not implemented");
        }],
        [request_type.OTHER_PLAYER_LEFT, (data) => {
            throw new Error("Not implemented");
        }]
    ]);
}

export module MPClient {
    export type Metadata = {
        player_id: string,
        game_id: string | undefined,
        auth_session: string
    };

    export const SERVER_URL = `http${MP_DEV ? 's' : ''}://${MP_URL}`;
    export const WS_URL = `ws${MP_DEV ? 's' : ''}://${MP_URL}`;

    export async function get_lobbies(): Promise<Lobby[]> {
        try {
            const response = await fetch(SERVER_URL + "/lobby");
            if (!response.ok) {
                console.error("Failed to get lobbies");
                return [];
            }

            return response.json();
        }
        catch (e) {
            console.error(`Failed to get lobbies: ${e}`);
            return [];
        }
    }
}