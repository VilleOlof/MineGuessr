import { PANEL_PASSWORD } from '$env/static/private';
import { error } from '@sveltejs/kit';

export async function load({ cookies }) {
    const pass = cookies.get('90gqguessr-panel-pass');
    if (!pass || pass !== PANEL_PASSWORD) {
        throw error(401, 'Unauthorized');
    }
}