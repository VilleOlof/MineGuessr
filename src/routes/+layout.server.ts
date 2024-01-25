import { DB } from "$lib/server/db";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
    const session = await locals.auth.validate();

    let stats = null;
    if (session) {
        stats = await DB.GetStatistics(session.user.user_id);
    }

    return {
        user: session?.user ?? null,
        server_stats: stats
    }
};