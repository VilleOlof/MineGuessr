import { logger } from '$lib/server/logger.js';
import { auth, discordAuth } from '$lib/server/lucia.js';
import { error, redirect } from '@sveltejs/kit';
import { env } from "$env/dynamic/public";

export async function GET({ cookies, url, locals }) {
    if (env.PUBLIC_DISCORD_ENABLED !== 'true') {
        return new Response("Not found", { status: 404 });
    }

    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    const stateCookie = cookies.get("MineGuessr-discord-state");

    if (!code) {
        logger.error("Missing code in Discord callback");
        error(400, "Bad request");
    }

    if (!state || !stateCookie || state !== stateCookie) {
        logger.error("Invalid state in Discord callback");
        error(400, "Bad request");
    }

    try {
        const discordUserAuth = await discordAuth!.validateCallback(code);

        const getUser = async () => {
            const existingUser = await discordUserAuth.getExistingUser();
            if (existingUser) return existingUser;

            return await discordUserAuth.createUser({
                attributes: {
                    user_id: discordUserAuth.discordUser.id,
                    username: discordUserAuth.discordUser.username,
                    avatar: discordUserAuth.discordUser.avatar,
                    perm_lvl: 0
                }
            });
        }

        const user = await getUser();

        const session = await auth.createSession({
            userId: user.userId,
            attributes: {}
        });
        locals.auth.setSession(session);
    }
    catch (e) {
        logger.error(`Error while validating Discord callback: ${e}`);
        error(400, "Bad request");
    }

    redirect(302, "/");
}