import { DB } from "$lib/server/db";
import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
    const session = await locals.auth.validate();

    let stats = null;
    if (session) {
        if (session.user.perm_lvl === DB.Permissions.Banned) {
            throw error(403, "Du är bannad");
        }

        stats = await DB.GetStatistics(session.user.user_id);
    }

    return {
        user: session?.user ?? null,
        server_stats: stats
    }
};