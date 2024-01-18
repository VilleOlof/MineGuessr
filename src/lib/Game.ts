import { UpdatePOIMarker, curr_bluemap, current_pos, type location_metadata } from "$lib";
import { get, writable, type Writable } from "svelte/store";
import * as THREE from "three";
import { Stats, type DBStats } from "./Stats";

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

export class Game {

    game_id: string;

    rounds: Writable<GameModule.Round[]> = writable([]);
    current_round: Writable<number> = writable(0);

    game_finished: Writable<boolean> = writable(false);

    private static markers_to_remove: string[] = ["guess_line", "current_pos", "correct_pos"];

    private static MARKER_Y_OFFSET = 200;
    private static MARKER_CENTER_OFFSET = 0.5;

    constructor(random_locations: location_metadata[]) {
        this.game_id = uuidv4();

        Stats.update((stats) => {
            stats.games_played += 1;
            return stats;
        });

        // Init rounds
        this.rounds.update(() => random_locations.map((loc) => {
            return {
                location: new THREE.Vector2(loc.coordinates[0], loc.coordinates[1]),
                guess_location: new THREE.Vector2(0, 0),
                distance: 0,
                time: 0,
                score: 0,
                panorama_id: loc.id,
                finished: false
            };
        }));
        console.log(get(this.rounds));

        console.log("Game created with id: " + this.game_id);
    }

    get_current_round(): GameModule.Round {
        let index = get(this.current_round);
        let rounds = get(this.rounds);

        return rounds[index];
    }

    async submit_guess(guess: THREE.Vector2) {
        if (get(current_pos) === null) {
            return;
        }

        let current_round = this.get_current_round();

        current_round.guess_location = guess;
        current_round.distance = current_round.location.distanceTo(guess);
        current_round.score = Game.calculate_score(current_round.distance);
        current_round.finished = true;

        if (current_round.distance === 0) {
            dispatchEvent(new CustomEvent("perfect_guess", { detail: current_round }));
        }

        this.rounds.update((rounds) => {
            rounds[get(this.current_round)] = current_round;
            return rounds;
        });

        Stats.update((stats) => {
            stats.total_score += current_round.score;
            stats.total_distance += current_round.distance;

            stats.average_score = stats.total_score / get(this.rounds).length;
            stats.average_distance = stats.total_distance / get(this.rounds).length;

            if (current_round.score > stats.best_score) {
                stats.best_score = current_round.score;
            }

            if (current_round.score < stats.worst_score) {
                stats.worst_score = current_round.score;
            }

            stats.total_time += current_round.time;

            return stats;
        });

        this.draw_line_to_guess(current_round.location, guess);
        this.place_correct_marker(current_round.location);

        this.move_camera_to_pos(current_round.location);

        await this.send_stats(current_round);
    }

    next_round() {
        if (get(this.game_finished)) return;

        // Check if game is finished
        if (get(this.current_round) >= get(this.rounds).length - 1) {
            this.game_finished.update(() => true);

            this.clear_markers();

            Stats.update((stats) => {
                stats.games_finished += 1;
                return stats;
            });

            return;
        }

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

        dispatchEvent(new CustomEvent("next_round", { detail: this.get_current_round() }));
    }

    public static calculate_score(distance: number): number {
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

    draw_line_to_guess(correct_loc: THREE.Vector2, guess_loc: THREE.Vector2, index?: number) {
        let map = get(curr_bluemap);

        if (map === null) {
            throw new Error("BlueMap is not initialized");
        }

        let mid_loc = new THREE.Vector2(
            (correct_loc.x + guess_loc.x) / 2,
            (correct_loc.y + guess_loc.y) / 2
        );
        map.popupMarkerSet.updateMarkerFromData(`guess_line${index !== undefined ? `_${index}` : ''}`, {
            position: { x: mid_loc.x + 0.5, y: Game.MARKER_Y_OFFSET, z: mid_loc.y + 0.5 },
            label: '',
            detail: '',
            line: [
                { x: correct_loc.x + Game.MARKER_CENTER_OFFSET, y: Game.MARKER_Y_OFFSET, z: correct_loc.y + Game.MARKER_CENTER_OFFSET },
                { x: guess_loc.x + Game.MARKER_CENTER_OFFSET, y: Game.MARKER_Y_OFFSET, z: guess_loc.y + Game.MARKER_CENTER_OFFSET }
            ],
            link: '',
            newTab: false,
            depthTest: true,
            lineWidth: 5,
            lineColor: { r: 255, g: 8, b: 8, a: 1 },
            minDistance: 0,
            maxDistance: 10000000,
            type: 'line'
        });
    }

    draw_all_guess_lines() {
        let rounds = get(this.rounds);

        for (let i = 0; i < rounds.length; i++) {
            let round = rounds[i];
            this.draw_line_to_guess(round.location, round.guess_location, i);
            this.place_correct_marker(round.location, i);

            let bluemap = get(curr_bluemap);
            if (bluemap) UpdatePOIMarker(bluemap, new THREE.Vector3(round.guess_location.x, Game.MARKER_Y_OFFSET, round.guess_location.y), i);
        }
    }

    place_correct_marker(correct_loc: THREE.Vector2, index?: number) {
        let map = get(curr_bluemap);

        if (map === null) {
            throw new Error("BlueMap is not initialized");
        }

        map.popupMarkerSet.updateMarkerFromData(`correct_pos${index !== undefined ? `_${index}` : ''}`, {
            position: { x: correct_loc.x + 0.5, y: Game.MARKER_Y_OFFSET, z: correct_loc.y + 0.65 },
            anchor: { x: 18.5, y: 36.5 },
            label: '',
            detail: '',
            sorting: 1000,
            listed: false,
            icon: 'pin-red.svg',
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

            // Remove clean markers
            let marker = map.popupMarkerSet.markers.get(marker_id);
            if (marker) {
                map.popupMarkerSet.remove(marker);
            }

            // Remove round specific tagged markers
            for (let round_id of get(this.rounds)) {
                let marker_name = `${marker_id}_${round_id}`;

                let marker = map.popupMarkerSet.markers.get(marker_name);
                if (marker) {
                    map.popupMarkerSet.remove(marker);
                }
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

    move_camera_to_pos(pos: THREE.Vector2) {
        let map = get(curr_bluemap);

        if (map === null) {
            throw new Error("BlueMap is not initialized");
        }

        let map_viewer = map.mapViewer.map;
        let controls = map.mapViewer.controlsManager;

        if (map_viewer) {
            controls.position.set(pos.x, 0, pos.y);
            controls.distance = 500;
            controls.angle = 0;
            controls.rotation = 0;
            controls.tilt = 0;
            controls.ortho = 0;
        }
        map.setFlatView(0);

        controls.controls = map.mapControls;

    }

    async send_stats(round?: GameModule.Round) {
        let curr_round = round ?? this.get_current_round();

        let stats: DBStats = {
            round_id: get(this.current_round),
            location_x: curr_round.location.x,
            location_z: curr_round.location.y,
            guess_x: curr_round.guess_location.x,
            guess_z: curr_round.guess_location.y,
            distance: curr_round.distance,
            time: curr_round.time,
            panorama_id: curr_round.panorama_id,
        };

        try {
            await fetch(`/stats/${this.game_id}`, {
                method: "POST",
                body: JSON.stringify(stats)
            });
        }
        catch (e) {
            console.log(e);
        }
    }
}

// https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid/2117523#2117523
function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        // @ts-ignore
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}