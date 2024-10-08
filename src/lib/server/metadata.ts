import type { location_metadata } from "../../../shared";
import { readFileSync } from "fs";

/**
 * Gets the location metadata from the loc_metadata.json file
 * 
 * @returns {location_metadata[]} The location metadata
 */
export function get_loc_metadata(): location_metadata[] {
    let file_content = readFileSync("src/lib/server/loc_metadata.json", "utf-8");
    let loc_metadata: location_metadata[] = JSON.parse(file_content);

    return loc_metadata;
}