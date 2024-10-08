import { logger } from '$lib/server/logger';
import { DB } from '$lib/server/db.js';
import { z } from 'zod';

const SuggestionSchema = z.object({
    text: z.string().min(1).max(1000),
});

export async function POST({ request }) {
    try {
        let body = await request.json();
        let suggestion = SuggestionSchema.safeParse(body);

        if (!suggestion.success) {
            logger.error(`Invalid suggestion: ${suggestion.error}`);
            return new Response("Bad Request", { status: 400 });
        }

        await DB.AddSuggestion(suggestion.data.text);

        return new Response("OK", { status: 200 });
    }
    catch (e) {
        logger.error(`Error while adding suggestion: ${e}`);

        return new Response("Internal Server Error", { status: 500 });
    }
}