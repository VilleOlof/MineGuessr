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

    /**
     * Calculates the score from a distance
     * 
     * This needs to have the same calculation method as the
     * sql query in DB.GetTopGames in order to be synced.
     * 
     * @param distance The distance to calculate the score from
     * @returns The score
     */
    export function calculate_score(distance: number): number {
        // if the distanceis below 16 meters, the score is a perfect 5000.
        // and for each meter after that, the score is reduced by 0.25.
        const MAX_SCORE = 5000;
        const MIN_DISTANCE = 16;

        let score = MAX_SCORE - (distance - MIN_DISTANCE) * 0.25;

        if (score < 0) {
            score = 0;
        }
        else if (score > MAX_SCORE) {
            score = MAX_SCORE;
        }

        return Math.round(score);
    }
}