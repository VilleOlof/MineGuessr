import { writable, type Writable } from "svelte/store";
import * as THREE from "three";
import type { BlueMapApp } from "./BlueMap/BlueMapApp";

export const MAP_URL = "http://127.0.0.1:40401";

export const current_pos: Writable<THREE.Vector3 | null> = writable(null);
export let curr_bluemap: Writable<BlueMapApp | null> = writable(null);

export type location_metadata = {
    id: number,
    coordinates: [number, number]
}

export function UpdatePOIMarker(map: BlueMapApp, pos: THREE.Vector3, index?: number) {
    map.popupMarkerSet.updateMarkerFromData(`current_pos${index !== undefined ? `_${index}` : ''}`, {
        position: { x: pos.x, y: pos.y, z: pos.z },
        anchor: { x: 0.5, y: 0.5 },
        iconAnchor: { x: 0.5, y: 0.5 },
        label: '',
        detail: '',
        sorting: 1000,
        listed: false,
        icon: 'pin.svg',
        classes: ['current_pos'],
        minDistance: 0,
        maxDistance: 10000000,
        type: 'poi'
    });
}

export function format_time(time: number) {
    if (isNaN(time)) return "00:00";

    // Minutes and seconds, like MM:SS
    let minutes = Math.floor(time / 60);
    let seconds = Math.floor(time % 60);

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}