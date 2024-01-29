import { Game } from "$lib/Game.js";
import { get_random_locations } from "$lib/server/locations";
import { get_loc_metadata } from "$lib/server/metadata";
import { redirect } from "@sveltejs/kit";
import prand from "pure-rand";

export const ssr = false;

const ROUNDS_PER_MATCH: number = 5;

export async function load({ url, cookies }) {
    const params = url.searchParams;
    const daily_mode = params.get('daily')?.toLocaleLowerCase() === 'true';

    const today = get_today_unix();

    if (daily_mode) {
        const user_latest_date = cookies.get('90gqguessr-latest_daily_date') ?? new Date(0).toISOString();
        const user_game_id = cookies.get('90gqguessr-latest_daily_id');

        const has_played = Game.check_daily(new Date(today), new Date(user_latest_date));
        if (has_played && user_game_id) {
            throw redirect(302, `/game/${user_game_id}`);
        }

        cookies.set('90gqguessr-latest_daily_date', new Date(today).toISOString(), {
            path: '/',
            expires: new Date(today + 86400000)
        });
    }

    const possible_locations = get_loc_metadata();

    const rng = prand.xoroshiro128plus(today);

    const random = daily_mode ?
        () => prand.unsafeUniformIntDistribution(0, possible_locations.length - 1, rng) :
        () => Math.floor(Math.random() * possible_locations.length - 1);

    const locations = get_random_locations(ROUNDS_PER_MATCH, possible_locations, random);

    return {
        random_locations: locations,
        daily: daily_mode,
        server_date: today
    }
}

/**
 * Gets the unix timestamp of today
 * 
 * @returns The unix timestamp of today
 */
function get_today_unix() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return today.getTime();
}