import { expect, test, describe, vi } from 'vitest';
import { ThreeHandler } from '$lib/Three';
import * as THREE from 'three';
import CameraControls from 'camera-controls';

describe('ThreeHandler', () => {
    const size: ThreeHandler.Size = [800, 600];
    CameraControls.install({ THREE: THREE });

    test('create_camera should return a perspective camera', () => {
        const camera = ThreeHandler.create_camera(size);

        expect(camera).toBeInstanceOf(THREE.PerspectiveCamera);
        expect(camera.aspect).toBe(size[0] / size[1]);
    });

    test('create_renderer should return a webgl renderer', () => {
        const renderer = ThreeHandler.create_renderer(size);

        expect(renderer).toBeInstanceOf(THREE.WebGLRenderer);
        expect(renderer.getSize(new THREE.Vector2())).toEqual(new THREE.Vector2(...size));
    });

    test('create_camera_controls should return a camera controls', () => {
        const camera = ThreeHandler.create_camera(size);
        const renderer = ThreeHandler.create_renderer(size);

        const cameraControls = ThreeHandler.create_camera_controls(camera, renderer.domElement);

        expect(cameraControls).toBeInstanceOf(CameraControls);
    });

    test('random_camera_direction should mutate the camera', () => {
        const angles = [0, 90, 180, 270];

        const camera = ThreeHandler.create_camera(size);
        const renderer = ThreeHandler.create_renderer(size);

        const cameraControls = ThreeHandler.create_camera_controls(camera, renderer.domElement);

        ThreeHandler.random_camera_direction(cameraControls);

        const anglesContains = angles.includes(cameraControls.azimuthAngle * 180 / Math.PI);
        expect(anglesContains).toBe(true);
    });
});
