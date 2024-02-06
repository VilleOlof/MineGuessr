export * from './GameModule';

/** Rounds per game */
export const ROUNDS_PER_MATCH: number = 5;

export type location_metadata = {
    id: number,
    coordinates: [number, number]
}