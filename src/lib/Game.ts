import { curr_bluemap, current_pos, type location_metadata } from "$lib";
import { get, writable, type Writable } from "svelte/store";
import * as THREE from "three";

export module Game {
    export type Round = {
        location: THREE.Vector2;
        guess_location: THREE.Vector2;
        distance: number;
        time: number;
        score: number;
        panorama_id: number;
    }
}

export class Game {

    game_id: string;

    rounds: Writable<Game.Round[]> = writable([]);
    current_round: Writable<number> = writable(0);

    private static markers_to_remove: string[] = ["guess_line", "current_pos", "correct_pos"];

    private static MARKER_Y_OFFSET = 200;
    private static MARKER_CENTER_OFFSET = 0.5;

    constructor(random_locations: location_metadata[]) {
        this.game_id = uuidv4();

        // Init rounds
        this.rounds.update(() => random_locations.map((loc) => {
            return {
                location: new THREE.Vector2(loc.coordinates[0], loc.coordinates[1]),
                guess_location: new THREE.Vector2(0, 0),
                distance: 0,
                time: 0,
                score: 0,
                panorama_id: loc.id,
            };
        }));

        console.log("Game created with id: " + this.game_id);
    }

    get_current_round(): Game.Round {
        let index = get(this.current_round);
        let rounds = get(this.rounds);

        return rounds[index];
    }

    submit_guess(guess: THREE.Vector2) {
        let current_round = this.get_current_round();
        console.log("Guess submitted: " + guess.x + ", " + guess.y);

        current_round.guess_location = guess;
        current_round.distance = current_round.location.distanceTo(guess);
        current_round.score = this.calculate_score(current_round.distance);

        this.rounds.update((rounds) => {
            rounds[get(this.current_round)] = current_round;
            return rounds;
        });

        this.draw_line_to_guess(current_round.location, guess);
        this.place_correct_marker(current_round.location);
    }

    next_round() {
        this.current_round.update((i) => {
            let new_i = i + 1;
            if (new_i >= get(this.rounds).length) {
                throw new Error("Game is already finished");
            }

            return new_i;
        });

        // Clear guess line
        this.clear_markers();
        // Reset camera
        this.reset_view();

        //Reset coords
        current_pos.update(() => null);
    }

    private calculate_score(distance: number): number {
        // if the distanceis below 16 meters, the score is a perfect 5000.
        // and for each meter after that, the score is reduced by 0.25.

        let score = 5000 - (distance - 16) * 0.25;

        if (score < 0) {
            score = 0;
        }

        return Math.round(score);
    }

    draw_line_to_guess(correct_loc: THREE.Vector2, guess_loc: THREE.Vector2) {
        let map = get(curr_bluemap);

        if (map === null) {
            throw new Error("BlueMap is not initialized");
        }

        let mid_loc = new THREE.Vector2(
            (correct_loc.x + guess_loc.x) / 2,
            (correct_loc.y + guess_loc.y) / 2
        );
        map.popupMarkerSet.updateMarkerFromData('guess_line', {
            position: { x: mid_loc.x, y: Game.MARKER_Y_OFFSET, z: mid_loc.y },
            label: '',
            detail: '',
            line: [
                { x: correct_loc.x + Game.MARKER_CENTER_OFFSET, y: Game.MARKER_Y_OFFSET, z: correct_loc.y + Game.MARKER_CENTER_OFFSET },
                { x: guess_loc.x + Game.MARKER_CENTER_OFFSET, y: Game.MARKER_Y_OFFSET, z: guess_loc.y + Game.MARKER_CENTER_OFFSET }
            ],
            link: '',
            newTab: false,
            depthTest: false,
            lineWidth: 5,
            lineColor: { r: 255, g: 0, b: 0, a: 1 },
            minDistance: 0,
            maxDistance: 10000000,
            type: 'line'
        });
    }

    place_correct_marker(correct_loc: THREE.Vector2) {
        let map = get(curr_bluemap);

        if (map === null) {
            throw new Error("BlueMap is not initialized");
        }

        map.popupMarkerSet.updateMarkerFromData('correct_pos', {
            position: { x: correct_loc.x, y: Game.MARKER_Y_OFFSET, z: correct_loc.y },
            anchor: { x: Game.MARKER_CENTER_OFFSET, y: Game.MARKER_CENTER_OFFSET },
            iconAnchor: { x: Game.MARKER_CENTER_OFFSET, y: Game.MARKER_CENTER_OFFSET },
            label: '',
            detail: '',
            sorting: 1000,
            listed: false,
            icon: 'correct.svg',
            classes: ['correct_pos'],
            minDistance: 0,
            maxDistance: 10000000,
            type: 'poi'
        });
    }

    clear_markers() {
        // Remove guess line
        let map = get(curr_bluemap);

        if (map === null) {
            throw new Error("BlueMap is not initialized");
        }

        // Remove markers
        for (let marker_id of Game.markers_to_remove) {
            let marker = map.popupMarkerSet.markers.get(marker_id);
            if (marker) {
                map.popupMarkerSet.remove(marker);
            }
        }
    }

    reset_view() {
        let map = get(curr_bluemap);

        if (map === null) {
            throw new Error("BlueMap is not initialized");
        }

        map.resetCamera();
    }
}

// https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid/2117523#2117523
function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        // @ts-ignore
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}