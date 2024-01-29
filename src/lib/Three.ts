import * as THREE from 'three';
import CameraControls from 'camera-controls';

/** Core Panorama ThreeJS function */
export module ThreeHandler {

    /** The width and height */
    export type Size = [number, number];

    /**
     * Takes in a scene and a panorama index  
     * and mutates the scenes background to the panorama
     * 
     * @param scene The scene to mutate
     * @param index The index of the panorama to use
     */
    export function change_panorama(scene: THREE.Scene, index: number) {
        const loader =
            new THREE.CubeTextureLoader()
                .setPath(`/locations/${index}/`);

        const EXTENSION = 'webp';

        const file_order = [1, 3, 4, 5, 0, 2];
        const file_names = file_order.map(i => `panorama_${i}.${EXTENSION}`);

        const background = loader.load(file_names, undefined, undefined, () => {
            console.error('Failed to load panorama');
        });

        scene.background = background;
    }

    /**
     * Mutates the camera to either -90, 0, 90 or 180 degrees in radians
     * 
     * @param camera The camera to mutate
     */
    export function random_camera_direction(camera: CameraControls) {
        const random_rotation = Math.floor(Math.random() * 4) * 90 * Math.PI / 180;

        camera.rotateTo(random_rotation, 1.5, false);
    }

    /**
     * Creates camera controls for a camera and canvas
     * 
     * @param camera The camera to control
     * @param canvas The canvas to listen for events on
     * @returns The camera controls
     */
    export function create_camera_controls(camera: THREE.PerspectiveCamera, canvas: HTMLElement): CameraControls {
        const cameraControls = new CameraControls(camera, canvas);

        cameraControls.minDistance = cameraControls.maxDistance = 1;

        cameraControls.azimuthRotateSpeed = -0.35; // negative value to invert rotation direction
        cameraControls.polarRotateSpeed = -0.35; // negative value to invert rotation direction

        cameraControls.truckSpeed = 10;

        cameraControls.mouseButtons.wheel = CameraControls.ACTION.ZOOM;
        cameraControls.touches.two = CameraControls.ACTION.TOUCH_ZOOM_TRUCK;

        cameraControls.saveState();

        return cameraControls;
    }

    /**
     * Creates a perspective camera
     * 
     * @param size The width and height of the camera
     * @returns The camera
     */
    export function create_camera(size: Size): THREE.PerspectiveCamera {
        const camera = new THREE.PerspectiveCamera(
            60,
            size[0] / size[1],
            0.01,
            100
        );

        camera.position.set(0, 0, 1e-5);

        return camera;
    }

    /**
     * Creates a renderer
     * 
     * @param size The width and height of the renderer
     * @returns The renderer
     */
    export function create_renderer(size: Size): THREE.WebGLRenderer {
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(size[0], size[1]);

        return renderer;
    }
}