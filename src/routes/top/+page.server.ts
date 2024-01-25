import { DB } from '$lib/server/db.js';

export async function load({ locals }) {
    const session = await locals.auth.validate();

    return {
        logged_in: session?.user !== null,
        pages: await DB.GetAmountOfGamePages()
    }
}