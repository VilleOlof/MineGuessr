import { auth } from '$lib/server/lucia.js';

export async function GET({ locals, cookies }) {
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