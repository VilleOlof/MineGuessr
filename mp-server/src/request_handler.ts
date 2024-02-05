import { Server } from "bun";

export async function handler(request: Request, server: Server): Promise<Response | undefined> {
    if (server.upgrade(request)) {
        return;
    }

    return new Response("Not found", { status: 404 })
}