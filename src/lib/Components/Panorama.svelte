<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import CameraControls from 'camera-controls';
	import { ThreeHandler } from '$lib/Three';

	let three_wrapper: HTMLDivElement;
	let loading: boolean = true;

	export let index: number;
	$: {
		loading = true;
		ThreeHandler.change_panorama(scene, index);
		loading = false;
	}

	CameraControls.install({ THREE: THREE });

	let width = window.innerWidth;
	let height = window.innerHeight;

	const clock = new THREE.Clock();
	const scene = new THREE.Scene();

	ThreeHandler.change_panorama(scene, index);
	const renderer = ThreeHandler.create_renderer([width, height]);

	const camera = ThreeHandler.create_camera([width, height]);
	const cameraControls = ThreeHandler.create_camera_controls(camera, renderer.domElement);

	onMount(async () => {
		three_wrapper.appendChild(renderer.domElement);

		loading = false;

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

{#if loading}
	<div
		class="loadingContainer absolute left-0 top-0 flex h-full w-full items-center justify-center"
	>
		<p class="text-5xl text-cyan-400">Laddar panorama screenshot...</p>
	</div>
{/if}
<div id="threewrapper" bind:this={three_wrapper}></div>
