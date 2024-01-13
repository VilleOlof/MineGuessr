import type { location_metadata } from "$lib";

export function get_random_locations(amount: number, possible_locations: location_metadata[]): location_metadata[] {
    let loc_metadata: location_metadata[] = [];

    if (amount > possible_locations.length) {
        throw new Error("Amount of random locations requested is greater than the amount of possible locations");
    }

    for (let i = 0; i < amount; i++) {
        let random_index = Math.floor(Math.random() * possible_locations.length);
        let random_location = possible_locations[random_index];

        // Check if location is already in the array
        // TODO UNCOMMENT THIS WHEN WE GOT loc_metadata.json DATA
        // if (loc_metadata.find((loc) => loc.id === random_location.id)) {
        //     i--;
        //     continue;
        // }

        loc_metadata.push({
            id: random_location.id,
            coordinates: [random_location.coordinates[0], random_location.coordinates[1]]
        });
    }

    return loc_metadata;
}