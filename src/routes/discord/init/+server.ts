import { dev } from "$app/environment";
import { discordAuth } from "$lib/server/lucia";

export async function GET({ cookies }) {
    const [url, state] = await discordAuth.getAuthorizationUrl();

    cookies.set("90gqguessr-discord-state", state, {
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