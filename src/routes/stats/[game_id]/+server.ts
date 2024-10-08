import { logger } from '$lib/server/logger';
import { DBStatsSchema } from '$lib/Stats.js';
import { DB } from '$lib/server/db.js';

export async function POST({ request, params, locals }) {
    try {
        let game_id: string = params.game_id;

        let body = await request.json();

        let stats = DBStatsSchema.safeParse(body);
        if (!stats.success) {
            logger.error(`Invalid stats: ${stats.error}`);
            return new Response("Invalid stats", { status: 400 });
        }

        const session = await locals.auth.validate();

        await DB.CreateStatRow(game_id, stats.data, session?.user.userId ?? undefined);

        return new Response("OK", { status: 200 });
    }
    catch (e) {
        logger.error(`Error while adding stats: ${e}`);
        return new Response("Internal server error", { status: 500 })
    }
}