import { writable, type Writable } from "svelte/store";
import * as THREE from "three";
import type { BlueMapApp } from "./BlueMap/BlueMapApp";

export const current_pos: Writable<THREE.Vector3 | null> = writable(null);
export let curr_bluemap: Writable<BlueMapApp | null> = writable(null);

export const toast_style = 'background-color: rgb(17 24 39); color: white; font-family: Minecraft, sans-serif;';

// Disable Vue DevTools
// @ts-ignore
globalThis.__VUE_PROD_DEVTOOLS__ = false;

// TODO MOVE THESE TYPES AND FUNCTIONS TO SOME BETTER PLACE
export const PAGE_SIZE = 10;

export type location_metadata = {
    id: number,
    coordinates: [number, number]
}

export type TopGame = {
    user: {
        id: string;
        user_id: string;
        username: string;
        avatar: string | null;
    } | undefined;
    game_id: string;
    date: Date;
    total_score: number;
    total_distance: number;
    total_time: number;
    round_distance: number[];
};

export const GameType = {
    Normal: 0,
    Daily: 1
} as const;
export type GameType = typeof GameType[keyof typeof GameType];

/**
 * Adds a guess marker to the map
 * 
 * @param map The bluemap instance
 * @param pos The position of the marker
 * @param index The index of the marker, often used together with a round index
 */
export function UpdatePOIMarker(map: BlueMapApp, pos: THREE.Vector3, index?: number) {
    map.popupMarkerSet.updateMarkerFromData(`current_pos${index !== undefined ? `_${index}` : ''}`, {
        position: { x: pos.x + 0.5, y: pos.y, z: pos.z + 0.65 },
        anchor: { x: 18.5, y: 36.5 },
        label: '',
        detail: '',
        sorting: 1000,
        listed: false,
        icon: '/pin-red.svg',
        classes: ['current_pos'],
        minDistance: 0,
        maxDistance: 10000000,
        type: 'poi'
    });
}

/**
 * Formats a time in milliseconds to a string
 * 
 * @param time The time in milliseconds
 * @returns The formatted time (MM:SS)
 */
export function format_time(time: number) {
    if (isNaN(time)) return "00:00";

    // Minutes and seconds, like MM:SS
    let minutes = Math.floor(time / 60);
    let seconds = Math.floor(time % 60);

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Gets the discord avatar url
 * 
 * @param user_id The user id
 * @param avatar_hash The avatar hash
 * @returns The discord avatar url
 */
export function GetDiscordAvatarUrl(user_id: string, avatar_hash: string | null) {
    if (!avatar_hash) return `https://cdn.discordapp.com/embed/avatars/index.png`;
    return `https://cdn.discordapp.com/avatars/${user_id}/${avatar_hash}.png`;
}