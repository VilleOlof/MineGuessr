import { lucia } from "lucia";
import { discord } from "@lucia-auth/oauth/providers";
import { sveltekit } from "lucia/middleware";
import { dev } from "$app/environment";
import { prisma } from "@lucia-auth/adapter-prisma";
import { DB } from "./db";
import { env as priv_env } from "$env/dynamic/private";
import { env } from "$env/dynamic/public";

export const auth = lucia({
    env: dev ? "DEV" : "PROD",
    middleware: sveltekit(),
    adapter: prisma(DB.prisma),

    getUserAttributes: (data) => {
        return {
            user_id: data.user_id,
            username: data.username,
            avatar: data.avatar,
            perm_lvl: data.perm_lvl
        }
    }
});

export const discordAuth = env.PUBLIC_DISCORD_ENABLED === 'true' ? discord(auth, {
    clientId: priv_env.DISCORD_CLIENT_ID,
    clientSecret: priv_env.DISCORD_CLIENT_SECRET,
    redirectUri: priv_env.DISCORD_REDIRECT_URL,
    scope: ["identify"]
}) : null;

export type Auth = typeof auth;