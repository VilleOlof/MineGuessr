import { lucia } from "lucia";
import { discord } from "@lucia-auth/oauth/providers";
import { sveltekit } from "lucia/middleware";
import { dev } from "$app/environment";
import { prisma } from "@lucia-auth/adapter-prisma";
import { DB } from "./db";
import { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URL } from "$env/static/private";

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

export const discordAuth = discord(auth, {
    clientId: DISCORD_CLIENT_ID,
    clientSecret: DISCORD_CLIENT_SECRET,
    redirectUri: DISCORD_REDIRECT_URL,
    scope: ["identify"]
});

export type Auth = typeof auth;