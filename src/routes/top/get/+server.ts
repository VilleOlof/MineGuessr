import { DB } from '$lib/server/db.js';
import { logger } from '$lib/server/logger.js';

const PAGE_SIZE = 10;

export async function GET({ url }) {
    try {
        const params = new URLSearchParams(url.search);
        const page = parseInt(params.get('page') ?? '1') ?? 1;

        if (isNaN(page)) return new Response('Invalid page', { status: 400 });
        if (page < 1) return new Response('Invalid page', { status: 400 });

        const [limit, offset] = [PAGE_SIZE, (page - 1) * PAGE_SIZE];

        const games = await DB.GetTopGames(limit, offset);
        if (!games) return new Response('Internal Server Error', { status: 500 });
        if (games.length === 0) return new Response('Not Found', { status: 404 });

        return new Response(JSON.stringify(games, (k, v) => v === undefined ? null : v), {
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