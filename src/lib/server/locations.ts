import type { location_metadata } from "$lib";

/**
 * Gets x amount of total unique locations
 * possible_locations length must be greater than amount
 * 
 * @param amount The amount of random locations to get
 * @param possible_locations The possible locations to choose from
 * @returns {location_metadata[]} The random locations
 */
export function get_random_locations(amount: number, possible_locations: location_metadata[]): location_metadata[] {
    let loc_metadata: location_metadata[] = [];

    if (amount > possible_locations.length) {
        throw new Error("Amount of random locations requested is greater than the amount of possible locations");
    }

    for (let i = 0; i < amount; i++) {
        let random_index = Math.floor(Math.random() * possible_locations.length);
        let random_location = possible_locations[random_index];

        // Check if location is already in the array
        if (loc_metadata.find((loc) => loc.id === random_location.id)) {
            i--;
            continue;
        }

        loc_metadata.push({
            id: random_location.id,
            coordinates: [random_location.coordinates[0], random_location.coordinates[1]]
        });
    }

    return loc_metadata;
}