import { dev } from "$app/environment";
import { discordAuth } from "$lib/server/lucia";
import { env } from "$env/dynamic/public";

export async function GET({ cookies }) {
    if (env.PUBLIC_DISCORD_ENABLED !== 'true') {
        return new Response("Not found", { status: 404 });
    }

    const [url, state] = await discordAuth!.getAuthorizationUrl();

    cookies.set("MineGuessr-discord-state", state, {
        path: "/",
        httpOnly: true,
        secure: dev ? false : true,
        maxAge: 60 * 60
    });

    return new Response(JSON.stringify({ url }), {
        headers: {
            "Content-Type": "application/json"
        }
    });
}