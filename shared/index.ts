export * from './GameModule';

/** Rounds per game */
export const ROUNDS_PER_MATCH: number = 5;

export type location_metadata = {
    id: number,
    coordinates: [number, number]
}

/**
 * Generates a uuid
 * 
 * https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid/2117523#2117523
 * 
 * @returns The generated uuid
 */
export function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        // @ts-ignore
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}