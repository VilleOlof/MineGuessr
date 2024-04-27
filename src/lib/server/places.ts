import { readFileSync } from "fs";
import * as THREE from 'three';

export type Place = {
    name: string,
    position: { x: number, y: number }
};

/**
 * Gets the location metadata from the loc_metadata.json file
 * 
 * @returns {location_metadata[]} The location metadata
 */
export function get_places(): Place[] {
    let file_content = readFileSync("src/lib/server/places.json", "utf-8");
    console.log(file_content);
    try {
        let places_Raw: { [key: string]: [number, number] } = JSON.parse(file_content);

        if (places_Raw === null || places_Raw === undefined || Object.keys(places_Raw).length === 0) {
            return []
        }

        let places: Place[] = []
        for (let place in places_Raw) {
            places.push({
                name: place,
                position: {
                    x: places_Raw[place][0],
                    y: places_Raw[place][1]
                }
            });
        }

        return places;
    }
    catch (e) {
        console.error(e);
        return [];
    }
}