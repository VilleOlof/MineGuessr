<script lang="ts">
	import type { BlueMapApp } from '$lib/BlueMap/BlueMap';
	import EmptyContainer from '$lib/UI Components/Container/EmptyContainer.svelte';
	import MapCore from './MapCore.svelte';
	import * as THREE from 'three';
	import { UpdatePOIMarker, current_pos } from '$lib';
	import SmallButton from '$lib/UI Components/Button/SmallButton.svelte';
	import type { Place } from '$lib/server/places';
	import { Game } from '$lib/Game';
	import { onDestroy, onMount } from 'svelte';

	export let fullscreen: boolean = false;
	export let stop_interaction: boolean = false;
	export let enlarge_map: boolean = false;
	export let minimize_map: boolean = false;
	export let places: Place[] = [];

	let bluemap: BlueMapApp | null = null;

	onMount(() => {
		addEventListener('next_round', force_close);
		addEventListener('keyup', handle_keyup);
	});

	onDestroy(() => {
		removeEventListener('next_round', force_close);
		removeEventListener('keyup', handle_keyup);
	});

	const force_close = (ev: Event) => ResizeMap(ev, false);
	const sleep = (ms: number, callback: Function) => setTimeout(callback, ms);

	async function ResizeMap(ev: Event, force?: boolean) {
		enlarge_map = force ?? !enlarge_map;
		await new Promise((r) => setTimeout(r, 50)); // budget ass solution

		dispatchEvent(new Event('resize'));

		// background dispatch to make sure it did get resized
		new Promise((r) => setTimeout(r, 250)).then(() => {
			dispatchEvent(new Event('resize'));
		});
	}

	function handle_keyup(ev: KeyboardEvent) {
		if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(ev.key)) {
			let index = parseInt(ev.key);
			if (isNaN(index) || places[index] === null) return;
			let { x, y } = places[index].position;

			PlaceTeleport(new THREE.Vector2(x, y));
		}

		switch (ev.key) {
			case 'm': {
				ResizeMap(ev);
				break;
			}
			case 'h': {
				minimize_map = !minimize_map;

				sleep(100, () => dispatchEvent(new Event('resize')));
				sleep(250, () => dispatchEvent(new Event('resize')));

				break;
			}
			case '0': {
				Game.reset_view();

				break;
			}
		}
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

	let selected_place: string;
	let place_element: HTMLSelectElement;
	function PlaceTeleport(vector?: THREE.Vector2) {
		const [x, z] = vector
			? [vector.x, vector.y]
			: selected_place.split(',').map((c) => Number(c.trim()));

		Game.move_camera_to_pos(new THREE.Vector2(x, z));

		selected_place = '0, 0';
	}
</script>

{#if fullscreen}
	<div class="mapcontainer absolute left-0 top-0 h-full w-full">
		<MapCore bind:bluemap />
	</div>
{:else}
	<div
		class:bigmap={enlarge_map}
		class:no_m={enlarge_map}
		class="mapcontainer pointer-events-none absolute bottom-0 right-0 flex aspect-video h-auto w-full flex-col items-start justify-end gap-2 sm:m-2 sm:w-4/6 md:w-3/6 lg:w-2/6"
	>
		<span class="relative h-full w-full">
			<span id="mapmid" class="pointer-events-auto h-full w-full" class:hidden={minimize_map}>
				<EmptyContainer full={true}>
					<div class="mapWrapper relative h-full w-full">
						<MapCore
							bind:bluemap
							on:mapInteraction={(event) => {
								if (stop_interaction) return;

								let pos = GetPosFromInteraction(event);
								if (pos) $current_pos = pos;

								if (!$current_pos) return;

								if (bluemap) {
									UpdatePOIMarker(bluemap, $current_pos);
								}
							}}
						/>

						<div
							class="pointer-events-none absolute left-0 top-0 m-2 flex w-[96%] items-start justify-between gap-2 py-1 text-xl text-gray-200"
						>
							<div class="flex flex-col gap-2">
								<div class="flex items-center gap-2">
									<button
										on:click={async (ev) => await ResizeMap(ev)}
										title={enlarge_map ? 'Minimize map' : 'Enlarge map'}
										class="pointer-events-auto h-full bg-black/70 p-1 transition-transform hover:scale-105 active:scale-95"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											height="24"
											viewBox="0 -960 960 960"
											width="24"
											fill="currentColor"
											><path
												d="M120-120v-200h80v120h120v80H120Zm520 0v-80h120v-120h80v200H640ZM120-640v-200h200v80H200v120h-80Zm640 0v-120H640v-80h200v200h-80Z"
											/></svg
										>
									</button>
									<p class="bg-black/70 px-2">
										{#if $current_pos}
											x {$current_pos.x}, z {$current_pos.z}
										{:else}
											No position
										{/if}
									</p>
								</div>
								{#if places.length > 0}
									<select
										class="pointer-events-auto w-fit bg-black/70 p-1 px-2 text-gray-100"
										bind:value={selected_place}
										bind:this={place_element}
										on:change={() => PlaceTeleport()}
									>
										<option value="0, 0" disabled selected>Places</option>
										{#each places as place}
											<option value={place.position.x + ', ' + place.position.y}
												>{place.name}</option
											>
										{/each}
									</select>
								{/if}
							</div>
						</div>
					</div>
				</EmptyContainer>
			</span>

			{#if !enlarge_map}
				<span class="pointer-events-auto absolute bottom-0 right-0">
					<SmallButton on:click={() => (minimize_map = !minimize_map)}>
						<img
							src="/left_arrow.png"
							alt=""
							style="image-rendering: pixelated; {minimize_map ? 'transform: rotate(90deg);' : ''}"
							class="w-5 -rotate-90 py-1"
						/>
					</SmallButton>
				</span>
			{/if}
		</span>

		{#if !enlarge_map}
			<span class="pointer-events-auto w-full">
				<slot name="button" />
			</span>
		{/if}
	</div>
{/if}

<style>
	.hidden {
		display: none;
	}

	/* bit of a manual hacky way to dynamically change the map size */
	.bigmap {
		height: 100%;
		width: 100%;

		z-index: 30;
	}

	.no_m {
		margin: 0;
	}
</style>
