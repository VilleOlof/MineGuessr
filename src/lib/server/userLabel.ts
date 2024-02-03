import { readFileSync } from "fs";
import { logger } from "./logger";

export function load_labels_in_server() {
    const file_content = readFileSync('src/lib/server/userLabel.json', 'utf-8');
    const labels: { [key: string]: string } = JSON.parse(file_content);

    logger.info(`Labels loaded in server: ${Object.keys(labels).length}`);

    return labels ?? {};
}

export module UserLabel {
    /** Label name and it's corresponding hex color */
    /**
     * GOD FORBID, This fucking piece of 'Labels' is apparently somehow two different values?
     * ITS EMPTY ON THE CLIENT BUT POPULATED WITH A LOADED JSON IN THE SERVER. MAYBE HOW I LOAD IT BUT IDK??
     * for now i just never access this directly from the client and just server.
     * 
     * future problem <3 lov uuuu
     */
    export let Labels: { [key: string]: string } = {};

    export function get_valid_labels(labels: string[]): string[] {
        return labels.filter(label => label in Labels);
    }

    export function get_label_color(label: string): string {
        return Labels[label] || '#ffffff';
    }

    export function is_valid(label: string): boolean {
        return label in Labels;
    }
}