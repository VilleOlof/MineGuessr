import { Elysia } from 'elysia';

import { ws_route } from "./src/websocket_handler";

function Main() {
    const PORT = Bun.env.PORT || 3000;

    new Elysia()
        .use(ws_route)
        .get('/', () => {
            return new Response("OK", { status: 200 });
        })
        .listen(PORT)

    console.log(`MP server started on port ${PORT}!`);
}

Main();