import { PANEL_PASSWORD } from '$env/static/private';
import { logger } from '$lib/server/logger';
import { DB } from '$lib/server/db.js';
import { error } from '@sveltejs/kit';

export async function load({ cookies }) {
    const pass = cookies.get('90gqguessr-panel-pass');
    if (!pass || pass !== PANEL_PASSWORD) {
        logger.error('Unauthorized panel access');
        throw error(401, 'Unauthorized');
    }

    const latest_suggestions = await DB.GetSuggestions(5);
    const latest_games = await DB.GetStats(5);

    const total_games = await DB.GetTotalStats();
    const games_24h = await DB.GetTotalStatsWithinTime(1000 * 60 * 60 * 24);

    return {
        suggestions: latest_suggestions,
        games: latest_games,
        total_games: total_games,
        games_24h: games_24h
    }
}