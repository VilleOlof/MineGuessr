import { handler } from "./src/request_handler";
import { on_message, on_close, on_open } from "./src/websocket_handler";

function Main() {
    const PORT = Bun.env.PORT || 3000;

    Bun.serve({
        port: PORT,

        async fetch(request, server) {
            return await handler(request, server);
        },
        websocket: {
            message(ws, message) {
                on_message(ws, message);
            },
            open(ws) {
                on_open(ws);
            },
            close(ws) {
                on_close(ws);
            },
        }
    });

    console.log(`MP server started on port ${PORT}!`);
}

Main();