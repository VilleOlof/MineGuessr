import { get_random_locations } from '$lib/server/locations';
import { get_loc_metadata } from '$lib/server/metadata';
import { error } from '@sveltejs/kit';
import prand from 'pure-rand';
import { ROUNDS_PER_MATCH } from '../../../../shared';
import { get_places } from '$lib/server/places';

export const ssr = false;

export async function load({ cookies, url }) {
    const auth_cookie = cookies.get("auth_session");
    if (!auth_cookie) {
        error(401, "Unauthorized");
    }

    const params = url.searchParams;

    const possible_locations = get_loc_metadata();

    const locations = get_random_locations(
        ROUNDS_PER_MATCH,
        possible_locations,
        () => prand.unsafeUniformIntDistribution(
            0,
            possible_locations.length - 1,
            prand.xoroshiro128plus(
                Date.now() ^
                (Math.random() * 0x100000000)
            )
        )
    );

    const places = get_places();

    return {
        auth: auth_cookie,
        random_locations: locations,
        places: places,
        game_id: params.get('game_id')
    }
}