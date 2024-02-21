import { MP_URL } from "$env/static/private";
import { get_request_type_name, request_type, type Payloads, type WebsocketRequest } from "../../../shared/MP";

export class MPClient {
    private ws: WebSocket;

    private metadata: MPClient.Metadata;
    public client_debug: boolean = true;

    constructor(user_id: string, auth: string) {
        this.ws = new WebSocket(MP_URL);

        this.metadata = {
            player_id: user_id,
            game_id: undefined,
            auth_session: auth
        };
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
}

export module MPClient {
    export type Metadata = {
        player_id: string,
        game_id: string | undefined,
        auth_session: string
    };
}