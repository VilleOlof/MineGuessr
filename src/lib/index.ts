import { writable, type Writable } from "svelte/store";
import * as THREE from "three";
import type { BlueMapApp } from "./BlueMap/BlueMapApp";

export const current_pos: Writable<THREE.Vector3 | null> = writable(null);
export let curr_bluemap: Writable<BlueMapApp | null> = writable(null);

export type location_metadata = {
    id: number,
    coordinates: [number, number]
}