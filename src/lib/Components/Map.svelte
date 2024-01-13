<script lang="ts">
	import MapCore from './MapCore.svelte';
	import * as THREE from 'three';
	import { current_pos } from '$lib';
	import { BlueMapApp } from '$lib/BlueMap/BlueMap';

	let show_map_force: boolean = true;

	let bluemap: BlueMapApp | null = null;

	function UpdatePOIMarker(map: BlueMapApp, pos: THREE.Vector3) {
		map.popupMarkerSet.updateMarkerFromData('current_pos', {
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

	function GetPosFromInteraction(event: Event): THREE.Vector3 | null {
		// trust me bro, .detail exists
		// @ts-ignore
		let detail = event.detail.detail;

		let isHires = true;
		// @ts-ignore
		let int = detail.hiresHit;

		// @ts-ignore
		if (detail.lowresHits) {
			// @ts-ignore
			for (let i = 0; i < detail.lowresHits.length; i++) {
				if (!int) {
					isHires = false;
					// @ts-ignore
					int = detail.lowresHits[i];
				} else break;
			}
		}

		if (!int) return null;

		let position = new THREE.Vector3()
			.copy(int.pointOnLine || int.point)
			// @ts-ignore
			.add(detail.ray.direction.clone().multiplyScalar(0.05))
			.floor();

		return position;
	}
</script>

<div class="mapcontainer absolute bottom-0 right-0 flex aspect-video h-auto w-2/6 flex-row-reverse">
	<div class="mapWrapper h-full w-full" class:hidden={!show_map_force}>
		<MapCore
			bind:bluemap
			on:mapInteraction={(event) => {
				$current_pos = GetPosFromInteraction(event);
				if (!$current_pos) return;

				if (bluemap) {
					UpdatePOIMarker(bluemap, $current_pos);
				}
			}}
		/>
	</div>

	<button
		class="bg-gray-900 px-1 font-bold text-cyan-400 outline outline-4 outline-gray-900"
		on:click={() => (show_map_force = !show_map_force)}
	>
		{#if show_map_force}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				height="24"
				viewBox="0 -960 960 960"
				width="24"
				fill="currentColor"><path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z" /></svg
			>
		{:else}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				height="24"
				viewBox="0 -960 960 960"
				width="24"
				fill="currentColor"><path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z" /></svg
			>
		{/if}
	</button>
</div>

<style>
	.hidden {
		display: none;
	}
</style>
