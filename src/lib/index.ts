import { writable, type Writable } from "svelte/store";
import * as THREE from "three";

export const current_pos: Writable<THREE.Vector3 | null> = writable(null);