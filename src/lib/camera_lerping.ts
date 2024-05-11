import * as THREE from 'three';
import type { BlueMapApp, ControlsManager } from './BlueMap/BlueMap';

function exp_vector(curr_position: THREE.Vector3, target: THREE.Vector3, deltatime: number, speed: number): THREE.Vector3 {
    curr_position.x = exp_smooth(curr_position.x, target.x, deltatime, speed);
    curr_position.y = exp_smooth(curr_position.y, target.y, deltatime, speed);
    curr_position.z = exp_smooth(curr_position.z, target.z, deltatime, speed);

    return curr_position
}

// Exponential smoothing function
function exp_smooth(curr: number, target: number, dt: number, speed: number): number {
    return curr + (target - curr) * (1 - Math.exp(-dt * speed))
}

let current_animation: number | null = null;
const MIN_DISTANCE = 1500;

export function lerp_camera(controls: ControlsManager, map: BlueMapApp, target: THREE.Vector3) {
    clear_lerp();

    let last = performance.now();
    controls.distance = 750;

    const target_distance = target.distanceTo(controls.position);

    // if the camera is already close enough to the target, just set the position and return
    if (target_distance < MIN_DISTANCE) {
        controls.position.copy(target);
        controls.controls = map.mapControls;
        return;
    }

    const SPEED = 0.7 * (target_distance / 1000);
    const target_vec2 = new THREE.Vector2(target.x, target.z);

    const animate = () => {
        const now = performance.now();
        const delta = now - last;
        last = now;

        const new_position = exp_vector(controls.position, target, delta / 1000, SPEED);
        const new_vec1 = new THREE.Vector2(new_position.x, new_position.z);

        controls.position.copy(new_position);
        controls.controls = map.mapControls;

        // check if the camera is close enough to the target
        if (new_vec1.distanceTo(target_vec2) < (0.1 * SPEED)) {
            return;
        }

        current_animation = requestAnimationFrame(animate);
    }

    current_animation = requestAnimationFrame(animate);
}

export function clear_lerp() {
    if (current_animation) cancelAnimationFrame(current_animation);
}