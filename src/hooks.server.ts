import { logger } from '$lib/server/logger';
import { auth } from '$lib/server/lucia';
import type { Handle } from '@sveltejs/kit';

export function handleError({ event, error }) {
    logger.error(`Error while handling ${event.request.method} ${event.request.url}: ${error}`);
}

export const handle: Handle = async ({ event, resolve }) => {
    event.locals.auth = auth.handleRequest(event);
    return await resolve(event);
};