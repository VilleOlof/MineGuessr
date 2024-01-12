<!-- <script lang="ts">
	// .control-bar
	// #zoom-buttons

	let map: HTMLIFrameElement;

	function hide_map_controls() {
		console.log('hide_map_controls', map);
		if (!map || !map.contentDocument) return;

		const controlBar: HTMLDivElement | null | undefined =
			map.contentWindow?.document.querySelector('.control-bar');
		const zoomButtons: HTMLDivElement | null | undefined =
			map.contentWindow?.document.querySelector('#zoom-buttons');

		console.log(controlBar, zoomButtons);
		if (!controlBar || !zoomButtons) return;

		controlBar.style.display = 'none';
		zoomButtons.style.display = 'none';
	}
</script>

<div class="mapcontainer absolute bottom-0 right-0 aspect-video h-2/4 w-auto">
	<iframe
		bind:this={map}
		src="https://map.90gq.se/#overworld:279:0:245:1500:0:0:0:0:perspective"
		title="90gQ Map"
		frameborder="0"
		class="h-full w-full"
		on:load={hide_map_controls}
	></iframe>
</div>

<button on:click={hide_map_controls}>hide</button> -->

<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import CameraControls from 'camera-controls';
	import Map from '$lib/Components/Map.svelte';
	import MapCore from '$lib/Components/MapCore.svelte';

	let three_wrapper: HTMLDivElement;

	let background = new THREE.CubeTextureLoader()
		.setPath('/assets/skybox_test/')
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

			renderer.render(scene, camera);
		}
		animate();
	});
</script>

<div id="threewrapper" bind:this={three_wrapper}></div>

<Map />
