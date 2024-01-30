import { DB } from '$lib/server/db.js';
import { logger } from '$lib/server/logger.js';
import { UserLabel } from '$lib/userLabel.js';

// TODO: Low priority, but make this a bit more robust and modular

export async function GET({ url, locals }) {
    try {
        const session = await locals.auth.validate();
        if (!session || session.user.perm_lvl !== DB.Permissions.Admin) {
            return new Response('Unauthorized', { status: 401 });
        }

        const username = url.searchParams.get('username');
        if (!username) return new Response('Missing username', { status: 400 });

        const labels = await DB.UserLabels.GetLabels(username);
        if (!labels) return new Response('User not found', { status: 404 });

        return new Response(JSON.stringify({ labels }), {
            headers: {
                'content-type': 'application/json'
            }
        });
    }
    catch (e) {
        // @ts-ignore
        logger.error(e.message || e);
        return new Response("Internal server error", { status: 500 });
    }
}

export async function POST({ request, locals }) {
    try {
        const session = await locals.auth.validate();
        if (!session || session.user.perm_lvl !== DB.Permissions.Admin) {
            return new Response('Unauthorized', { status: 401 });
        }

        const body: { username: string, labels: string[] } = await request.json();
        const { username, labels } = body;
        if (!username || !labels) return new Response('Missing userId or color', { status: 400 });
        const valid_labels = UserLabel.get_valid_labels(labels);
        if (valid_labels.length === 0) return new Response('Invalid label', { status: 400 });

        await DB.UserLabels.SetLabels(username, valid_labels);

        return new Response(JSON.stringify({ labels: valid_labels }), {
            headers: {
                'content-type': 'application/json'
            }
        });
    }
    catch (e) {
        // @ts-ignore
        logger.error(e.message || e);
        return new Response("Internal server error", { status: 500 });
    }
}

export async function DELETE({ request, locals }) {
    try {
        const session = await locals.auth.validate();
        if (!session || session.user.perm_lvl !== DB.Permissions.Admin) {
            return new Response('Unauthorized', { status: 401 });
        }

        const body: { username: string, labels: string[] } = await request.json();
        const { username, labels } = body;
        if (!username || !labels) return new Response('Missing userId or color', { status: 400 });

        await DB.UserLabels.RemoveLabel(username, labels);

        return new Response(JSON.stringify({ labels }), {
            headers: {
                'content-type': 'application/json'
            }
        });
    }
    catch (e) {
        // @ts-ignore
        logger.error(e.message || e);
        return new Response("Internal server error", { status: 500 });
    }
}

export async function PUT({ request, locals }) {
    try {
        const session = await locals.auth.validate();
        if (!session || session.user.perm_lvl !== DB.Permissions.Admin) {
            return new Response('Unauthorized', { status: 401 });
        }

        const body: { username: string, labels: string[] } = await request.json();
        const { username, labels } = body;
        if (!username || !labels) return new Response('Missing userId or color', { status: 400 });
        const valid_labels = UserLabel.get_valid_labels(labels);
        if (valid_labels.length === 0) return new Response('Invalid labels', { status: 400 });

        await DB.UserLabels.UpdateLabels(username, valid_labels);

        return new Response(JSON.stringify({ labels }), {
            headers: {
                'content-type': 'application/json'
            }
        });
    }
    catch (e) {
        // @ts-ignore
        logger.error(e.message || e);
        return new Response("Internal server error", { status: 500 });
    }
}