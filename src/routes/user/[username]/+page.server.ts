import { DB } from '$lib/server/db.js';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    const { username } = params;
    if (!username) error(404, 'User not found');

    const user = await DB.GetUserByUsername(username);
    if (!user) error(404, 'User not found');

    return {
        profile_user: user
    }
}