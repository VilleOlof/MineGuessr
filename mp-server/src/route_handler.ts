import { Server } from "bun";
import { GameHandler } from "./game_handler";

export const route_handlers = new Map<string, (request: Request, server: Server) => Response>([
    ["/", () => {
        return new Response("OK", { status: 200 });
    }],
    ["/lobby", () => {
        const lobbies = GameHandler.get_open_lobbies();
        if (lobbies.length === 0) {
            return new Response("No lobbies", { status: 204 });
        }

        const lobbies_json = JSON.stringify(lobbies);

        return new Response(lobbies_json, {
            status: 200,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }]
]);
