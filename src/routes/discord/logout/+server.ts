import { auth } from '$lib/server/lucia.js';
import { env } from "$env/dynamic/public";

export async function GET({ locals, cookies }) {
    if (env.PUBLIC_DISCORD_ENABLED !== 'true') {
        return new Response("Not found", { status: 404 });
    }

    const session = await locals.auth.validate();
    if (!session) {
        return new Response(null, { status: 401 });
    }

    await auth.invalidateSession(session.sessionId);
    const sessionCookie = auth.createSessionCookie(null);

    return new Response(null, {
        status: 200,
        headers: {
            "Set-Cookie": sessionCookie.serialize()
        }
    });
}