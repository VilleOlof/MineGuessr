import { DB } from '$lib/server/db.js';
import { error } from '@sveltejs/kit';

export const ssr = false;

export async function load({ params }) {
    const game_id = params.game_id;
    if (!game_id) throw error(400, 'Bad request');

    const game = await DB.GetStat(game_id);
    if (!game) throw error(404, 'Not found');

    return {
        game_id: game_id,
        game: game
    }
}