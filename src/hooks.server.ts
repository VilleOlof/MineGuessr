import { logger } from '$lib/server/logger';

export function handleError({ event, error }) {
    logger.error(`Error while handling ${event.request.method} ${event.request.url}: ${error}`);
}