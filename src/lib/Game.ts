import { GameType, UpdatePOIMarker, curr_bluemap, current_pos, toast_style } from "$lib";
import { get, writable, type Writable } from "svelte/store";
import * as THREE from "three";
import { Stats, type DBStats } from "./Stats";
import type { Stat } from "@prisma/client";
import toast from "svelte-french-toast";
import { GameModule } from "../../shared/GameModule";
import { uuidv4, type location_metadata } from "../../shared";

/**
 * Represents a game
 * Controls everything from the game logic, to game state, etc.
 */
export class Game {

    /** The game id, used for  */
    game_id: string = "";
    /** The type of the game */
    game_type: GameType = GameType.Normal;

    rounds: Writable<GameModule.Round[]> = writable([]);
    current_round: Writable<number> = writable(0);

    game_finished: Writable<boolean> = writable(false);

    /** Markers to remove when clearing markers */
    private static markers_to_remove: string[] = ["guess_line", "current_pos", "correct_pos"];

    /** Markers y offset */
    private static MARKER_Y_OFFSET = 200;
    /** Markers center offset */
    private static MARKER_CENTER_OFFSET = 0.5;

    /**
     * Use the static create method to create a new game instead
     */
    constructor() { }

    /**
     * Creates a new game
     * 
     * @param random_locations The locations to use for the game
     * @returns The created game
     */
    static create(random_locations: location_metadata[], type?: GameType): Game {
        let game = new Game();

        game.game_id = uuidv4();

        Stats.update((stats) => {
            stats.games_played += 1;
            return stats;
        });

        if (type) game.game_type = type;

        // Init rounds
        game.rounds.update(() => random_locations.map((loc) => {
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

        console.log(`Game created with id: ${game.game_id}:${game.game_type}`);

        return game;
    }

    /**
     * Creates a game from the database
     * An alternative to the create method
     * 
     * @param game_id The games id
     * @param rounds The rounds to use for the game
     * @returns The created game
     */
    static create_from_db(game_id: string, rounds: Stat[]): Game {
        let game = new Game();

        game.game_id = game_id;
        game.game_type = rounds[0].game_type as GameType;

        game.rounds.update(() => rounds.map((round) => {
            return {
                location: new THREE.Vector2(round.location_x, round.location_z),
                guess_location: new THREE.Vector2(round.guess_x, round.guess_z),
                distance: round.distance,
                time: round.time,
                score: GameModule.calculate_score(round.distance),
                panorama_id: round.panorama_id,
                finished: true
            };
        }));

        game.game_finished.update(() => true);

        return game;
    }

    /**
     * Checks a local cookie against the servers daily date to see if the daily game has been played
     * 
     * @returns True if the daily game has been played, false otherwise
     */
    static check_daily(server_date: Date, user_date: Date): boolean {
        if (user_date < server_date) {
            return false;
        }

        return true;
    }

    /**
     * Gets the current round
     * 
     * @returns The current round
     */
    get_current_round(): GameModule.Round {
        let index = get(this.current_round);
        let rounds = get(this.rounds);

        return rounds[index];
    }

    /**
     * Submits a guess
     * 
     * @param guess The guess to submit (x, z)
     * @returns The current round
     */
    async submit_guess(guess: THREE.Vector2) {
        if (get(current_pos) === null) {
            return;
        }

        let current_round = this.get_current_round();

        current_round.guess_location = guess;
        current_round.distance = current_round.location.distanceTo(guess);
        current_round.score = GameModule.calculate_score(current_round.distance);
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

        Game.draw_line_to_guess(current_round.location, guess);
        Game.place_correct_marker(current_round.location);

        Game.move_camera_to_pos(current_round.location);

        await this.send_stats(current_round);


        if (this.game_type === GameType.Daily) {
            document.cookie = `90gqguessr-latest_daily_id=${this.game_id}; path=/; expires=${new Date(Date.now() + 86400000).toUTCString()}`;
        }
    }

    /**
     * Continues to the next round
     * 
     * Dispatches a next_round event
     */
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
        Game.reset_view();

        //Reset coords
        current_pos.update(() => null);

        dispatchEvent(new CustomEvent("next_round", { detail: this.get_current_round() }));
    }

    /**
     * Draws a line from the correct location to the guess location
     * 
     * @param correct_loc The correct location
     * @param guess_loc The guess location
     * @param index The index of the round, optional for marker indexing
     */
    static draw_line_to_guess(correct_loc: THREE.Vector2, guess_loc: THREE.Vector2, index?: number) {
        let map = get(curr_bluemap);

        if (map === null) {
            throw new Error("BlueMap is not initialized");
        }

        let mid_loc = new THREE.Vector2(
            (correct_loc.x + guess_loc.x) / 2,
            (correct_loc.y + guess_loc.y) / 2
        );
        console.log(mid_loc);
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

    /**
     * Draws all guess lines
     */
    draw_all_guess_lines() {
        let rounds = get(this.rounds);

        for (let i = 0; i < rounds.length; i++) {
            let round = rounds[i];
            Game.draw_line_to_guess(round.location, round.guess_location, i);
            Game.place_correct_marker(round.location, i);

            let bluemap = get(curr_bluemap);
            if (bluemap) UpdatePOIMarker(bluemap, new THREE.Vector3(round.guess_location.x, Game.MARKER_Y_OFFSET, round.guess_location.y), i);
        }
    }

    /**
     * Places a marker at the correct location
     * 
     * @param correct_loc The correct location
     * @param index The index of the round, optional for marker indexing
     */
    static place_correct_marker(correct_loc: THREE.Vector2, index?: number) {
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
            icon: '/pin-red.svg',
            classes: ['correct_pos'],
            minDistance: 0,
            maxDistance: 10000000,
            type: 'poi'
        });
    }

    /**
     * Clears all markers
     */
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
            for (let i = 0; i < get(this.rounds).length; i++) {
                let marker_name = `${marker_id}_${i}`;

                let marker = map.popupMarkerSet.markers.get(marker_name);
                if (marker) {
                    map.popupMarkerSet.remove(marker);
                }
            }
        }
    }

    /**
     * Resets the camera to the default position
     */
    static reset_view() {
        let map = get(curr_bluemap);

        if (map === null) {
            throw new Error("BlueMap is not initialized");
        }

        map.resetCamera();
    }

    /**
     * Moves the camera to a position
     * 
     * @param pos 
     */
    static move_camera_to_pos(pos: THREE.Vector2) {
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

    /**
     * Sends the stats to the server
     * 
     * @param round The round to send the stats from, optional
     */
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
            game_type: this.game_type
        };

        try {
            await fetch(`/stats/${this.game_id}`, {
                method: "POST",
                body: JSON.stringify(stats)
            });
        }
        catch (e) {
            console.log(`Error while sending stats: ${e}`);

            toast.error("Kunde inte skicka statistik till servern", {
                style: toast_style
            });
        }
    }
}