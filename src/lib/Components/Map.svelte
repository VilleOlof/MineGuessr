<script lang="ts">
	import MapCore from './MapCore.svelte';
	import * as THREE from 'three';
	import { current_pos } from '$lib';
	import { BlueMapApp, PoiMarker } from '$lib/BlueMap/BlueMap';

	let show_map_force: boolean = true;
	let pos_marker: PoiMarker | null = null;

	let bluemap: BlueMapApp | null = null;

	function UpdatePOIMarker(map: BlueMapApp, pos: THREE.Vector3) {
		map.popupMarkerSet.updateMarkerFromData('current_pos', {
			position: { x: pos.x, y: pos.y, z: pos.z },
			anchor: { x: 0, y: 0 },
			iconAnchor: { x: 0, y: 0 },
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

<div class="mapcontainer absolute bottom-0 right-0 flex aspect-video h-2/4 w-auto flex-row-reverse">
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

<h1 class="absolute left-0 top-0 m-2 rounded-md bg-gray-900 p-2 text-4xl font-bold text-cyan-400">
	{#if $current_pos}
		{$current_pos.x}, {$current_pos.y}, {$current_pos.z}
	{:else}
		No position
	{/if}
</h1>

<style>
	.hidden {
		display: none;
	}

	:global(.current_pos) {
		background-color: rgb(17 24 39);
		padding: 0.5rem;
		font-size: 1.5rem;
		border-radius: 0.5rem;
	}

	:global(.bm-marker-poi-icon) {
		filter: invert(70%) sepia(30%) saturate(2641%) hue-rotate(148deg) brightness(104%) contrast(87%);
		width: 100%;
		height: 100%;
	}
</style>
