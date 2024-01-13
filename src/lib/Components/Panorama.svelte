<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import CameraControls from 'camera-controls';
	import Stats from 'three/addons/libs/stats.module.js';

	let three_wrapper: HTMLDivElement;

	export let index: number;

	let background = new THREE.CubeTextureLoader()
		.setPath(`/locations/${index}/`)
		.load([
			'panorama_1.png',
			'panorama_3.png',
			'panorama_4.png',
			'panorama_5.png',
			'panorama_0.png',
			'panorama_2.png'
		]);

	CameraControls.install({ THREE: THREE });

	let width = window.innerWidth;
	let height = window.innerHeight;

	const clock = new THREE.Clock();

	const scene = new THREE.Scene();
	scene.background = background;

	const camera = new THREE.PerspectiveCamera(60, width / height, 0.01, 100);
	camera.position.set(0, 0, 1e-5);

	const renderer = new THREE.WebGLRenderer();
	renderer.setSize(width, height);
	document.body.appendChild(renderer.domElement);

	const cameraControls = new CameraControls(camera, renderer.domElement);
	cameraControls.minDistance = cameraControls.maxDistance = 1;
	cameraControls.azimuthRotateSpeed = -0.35; // negative value to invert rotation direction
	cameraControls.polarRotateSpeed = -0.35; // negative value to invert rotation direction
	cameraControls.truckSpeed = 10;
	cameraControls.mouseButtons.wheel = CameraControls.ACTION.ZOOM;
	cameraControls.touches.two = CameraControls.ACTION.TOUCH_ZOOM_TRUCK;
	cameraControls.saveState();

	onMount(() => {
		three_wrapper.appendChild(renderer.domElement);

		let stats = new Stats();
		// document.body.appendChild(stats.dom);

		function animate() {
			requestAnimationFrame(animate);

			const delta = clock.getDelta();
			cameraControls.update(delta);

			if (width !== window.innerWidth || height !== window.innerHeight) {
				width = window.innerWidth;
				height = window.innerHeight;
				renderer.setSize(width, height);
				camera.aspect = width / height;
				camera.updateProjectionMatrix();
			}

			stats.update();

			renderer.render(scene, camera);
		}
		animate();
	});
</script>

<div id="threewrapper" bind:this={three_wrapper}></div>
