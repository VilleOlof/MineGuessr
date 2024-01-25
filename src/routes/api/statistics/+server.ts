import { StatsSchema } from '$lib/Stats.js';
import { DB } from '$lib/server/db.js';
import { logger } from '$lib/server/logger.js';

export async function GET({ locals }) {
    try {
        const session = await locals.auth.validate();
        if (!session) return new Response('Unauthorized', { status: 401 });

        const stats = await DB.GetStatistics(session.user.user_id);
        if (!stats) return new Response('Internal Server Error', { status: 500 });

        return new Response(JSON.stringify(stats), {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
    catch (e) {
        console.log(e);
        logger.error(e);
        return new Response('Internal Server Error', { status: 500 });
    }
}

export async function POST({ locals, request }) {
    try {
        const session = await locals.auth.validate();
        if (!session) return new Response('Unauthorized', { status: 401 });

        const body = await request.json();

        const parsed = StatsSchema.safeParse(body);
        if (!parsed.success) {
            logger.error(parsed.error);
            return new Response('Invalid body', { status: 400 });
        }
        const stats = parsed.data;

        let db_stats = await DB.UpsertStatistics(session.user.user_id, stats);

        return new Response(JSON.stringify({
            status: 'ok',
            update: db_stats.updated_at
        }), { status: 200 });
    }
    catch (e) {
        console.log(e);
        return new Response('Internal Server Error', { status: 500 });
    }
}