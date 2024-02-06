/**
 * Game types
 */
export module GameModule {
    export type Round = {
        location: THREE.Vector2;
        guess_location: THREE.Vector2;
        distance: number;
        time: number;
        score: number;
        panorama_id: number;
        finished: boolean;
    }
}