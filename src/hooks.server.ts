import { UserLabel, load_labels_in_server } from '$lib/server/userLabel';
import { logger } from '$lib/server/logger';
import { auth } from '$lib/server/lucia';
import type { Handle } from '@sveltejs/kit';

// Load user labels from the server
const user_labels = load_labels_in_server();
UserLabel.Labels = user_labels;

export function handleError({ event, error }) {
    logger.error(`Error while handling ${event.request.method} ${event.request.url}: ${error}`);
}

export const handle: Handle = async ({ event, resolve }) => {
    event.locals.auth = auth.handleRequest(event);
    return await resolve(event);
};