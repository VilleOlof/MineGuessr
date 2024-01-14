<script lang="ts">
	import MapCore from './MapCore.svelte';
	import * as THREE from 'three';
	import { UpdatePOIMarker, current_pos } from '$lib';
	import { BlueMapApp } from '$lib/BlueMap/BlueMap';
	import { Game } from '$lib/Game';
	import { get } from 'svelte/store';

	let show_map_force: boolean = true;

	export let fullscreen: boolean = false;
	export let game_instance: Game;

	let bluemap: BlueMapApp | null = null;

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

{#if fullscreen}
	<div class="mapcontainer absolute left-0 top-0 h-full w-full">
		<MapCore bind:bluemap />
	</div>
{:else}
	<div
		class="mapcontainer absolute bottom-0 right-0 flex aspect-video h-auto w-full flex-col items-center justify-center sm:w-4/6 md:w-3/6 lg:w-2/6"
	>
		{#if show_map_force}
			<div class="my-2 flex w-full items-center justify-center lg:hidden">
				<slot />
			</div>
		{/if}

		<div class="flex h-full w-full flex-1 flex-row-reverse">
			<div class="mapWrapper relative h-full w-full" class:hidden={!show_map_force}>
				<MapCore
					bind:bluemap
					on:mapInteraction={(event) => {
						if (game_instance.get_current_round().finished) return;

						let pos = GetPosFromInteraction(event);
						if (pos) $current_pos = pos;

						if (!$current_pos) return;

						if (bluemap) {
							UpdatePOIMarker(bluemap, $current_pos);
						}
					}}
				/>

				<p class="absolute left-0 top-0 m-2 bg-black/70 px-2 py-1 text-xl" title="Koordinater">
					{#if $current_pos}
						x {$current_pos.x}, z {$current_pos.z}
					{:else}
						Ingen position
					{/if}
				</p>
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
						fill="currentColor"
						><path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z" /></svg
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
	</div>
{/if}

<style>
	.hidden {
		display: none;
	}
</style>
