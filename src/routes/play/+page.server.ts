import { get_random_locations } from "$lib/server/locations";
import { get_loc_metadata } from "$lib/server/metadata";

export const ssr = false;

export async function load() {
    const possible_locations = get_loc_metadata();
    const locations = get_random_locations(5, possible_locations);

    return {
        random_locations: locations
    }
}