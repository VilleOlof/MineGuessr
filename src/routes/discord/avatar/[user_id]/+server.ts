import { env } from "$env/dynamic/public";
import { env as env_priv } from "$env/dynamic/private";

type DiscordUser = {
    id: string;
    username: string;
    discriminator: string;
    avatar: string;
    verified: boolean;
    email: string;
    flags: number;
    banner: string;
    accent_color: number;
    premium_type: number;
    public_flags: number;
}

export async function GET({ params }) {
    if (env.PUBLIC_DISCORD_ENABLED !== 'true') {
        return new Response("Not found", { status: 404 });
    }

    const user_id = params.user_id;

    const avatar_url = env_priv.DISCORD_BOT_TOKEN ? await get_avatar_url(user_id) : get_default_avatar_url();

    return new Response(null, {
        status: 302,
        headers: {
            "Location": avatar_url
        }
    });
}

async function get_avatar_url(user_id: string) {
    const user = await get_user(user_id);
    if (!user) {
        return get_default_avatar_url();
    }

    return `https://cdn.discordapp.com/avatars/${user_id}/${user.avatar}.png`;
}

function get_default_avatar_url() {
    const random_index = Math.floor(Math.random() * 5);
    return `https://cdn.discordapp.com/embed/avatars/${random_index}.png`;
}

async function get_user(user_id: string): Promise<DiscordUser | null> {
    try {
        const user_res = await fetch(`https://discord.com/api/users/${user_id}`, {
            headers: {
                "Authorization": `Bot ${env_priv.DISCORD_BOT_TOKEN}`,
                "Content-Type": "application/json",
                "User-Agent": "MineGuessr"
            }
        });

        if (!user_res.ok) {
            return null;
        }

        return await user_res.json();
    }
    catch (e) {
        return null;
    }
}