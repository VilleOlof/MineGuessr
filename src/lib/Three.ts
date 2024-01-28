import * as THREE from 'three';
import CameraControls from 'camera-controls';

export module ThreeHandler {

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

    export function create_camera(): THREE.PerspectiveCamera {
        const width = window.innerWidth;
        const height = window.innerHeight;

        const camera = new THREE.PerspectiveCamera(
            60,
            width / height,
            0.01,
            100
        );

        camera.position.set(0, 0, 1e-5);

        return camera;
    }
}