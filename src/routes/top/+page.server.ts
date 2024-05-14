import { DB } from '$lib/server/db.js';
import { UserLabel } from '$lib/server/userLabel';
import { env } from '$env/dynamic/public';
import { error } from '@sveltejs/kit';

export async function load({ locals }) {
    if (env.PUBLIC_DISCORD_ENABLED !== 'true') {
        error(404, "Not found");
    }

    const session = await locals.auth.validate();

    return {
        logged_in: session?.user !== null,
        pages: await DB.GetAmountOfGamePages(),
        labels: UserLabel.Labels // fuck you labels
    }
}