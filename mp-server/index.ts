import { Elysia } from 'elysia';

import { handler } from "./src/request_handler";
import { on_message, on_close, on_open } from "./src/websocket_handler";

function Main() {
    const PORT = Bun.env.PORT || 3000;

    // Bun.serve({
    //     port: PORT,

    //     async fetch(request, server) {
    //         return await handler(request, server);
    //     },
    //     websocket: {
    //         message(ws, message) {
    //             on_message(ws, message);
    //         },
    //         open(ws) {
    //             on_open(ws);
    //         },
    //         close(ws) {
    //             on_close(ws);
    //         },
    //     }
    // });

    // const ws_route = new Elysia()
    //     .group('/ws', (app) =>
    //         app
    //             .decorate('auth', () => true)
    //             .ws('/', {
    //                 message(ws, message) {
    //                     console.log(message);
    //                     ws.send('Hello from Elysia');
    //                 },
    //                 open(ws) {
    //                     console.log('Client connected');
    //                 },
    //                 beforeHandle({ auth }) {
    //                     if (!auth) {
    //                         return 'unauthorized';
    //                     }
    //                 }
    //             })
    //             .get('/', () => 'no websocket connection')
    //     );

    // new Elysia()
    //     .decorate('auth', () => true)
    //     .use(ws_route)
    //     .get('/', () => 'Hello Elysia')
    //     .listen(PORT);

    const auth_plugin = new Elysia().decorate('auth', () => {
        console.log('auth');
        return true;
    });

    const ws_route = new Elysia({ prefix: '/ws' })
        .use(auth_plugin)
        .ws('/', {
            beforeHandle({ auth }) {
                if (!auth) {
                    return 'unauthorized';
                }
            },
            message(ws, message) {
                ws.send(message);
            }
        });


    new Elysia()
        .use(ws_route)
        .listen(PORT)

    console.log(`MP server started on port ${PORT}!`);
}

Main();