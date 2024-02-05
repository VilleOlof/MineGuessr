import { ServerWebSocket } from "bun";

type WS = ServerWebSocket<unknown>;

export async function on_message(ws: WS, message: string | Buffer) { }
export async function on_open(ws: WS) { }
export async function on_close(ws: WS) { }