import { MPClient } from "$lib/multiplayer/Client";
import { error, type NumericRange } from "@sveltejs/kit";
import { env } from "$env/dynamic/public";

export async function load({ locals }) {
    if (env.PUBLIC_DISCORD_ENABLED !== 'true' || env.PUBLIC_MP_URL === undefined) {
        error(404, "Not found");
    }

    const session = await locals.auth.validate();
    if (!session) {
        return error(403, "You must be logged in to view this page");
    }

    try {
        const res = await fetch(MPClient.SERVER_URL);
        if (res.status !== 200) {
            error(res.status as NumericRange<400, 599>, "Failed to connect to the server");
        }
    }
    catch (e) {
        if (e instanceof Error) {
            console.error("Failed to connect to the mp server: " + e.message);
            if (e.message === "fetch failed") {
                console.error("Server is not running or is not reachable, probably");
            }
        }
        error(500, "Failed to connect to the server");
    }

    const lobbies = await MPClient.get_lobbies();

    return {
        lobbies: lobbies
    }
}