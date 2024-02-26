<script lang="ts">
	import MapCore from './MapCore.svelte';
	import * as THREE from 'three';
	import { UpdatePOIMarker, current_pos } from '$lib';
	import { BlueMapApp } from '$lib/BlueMap/BlueMap';
	import { Game } from '$lib/Game';
	import { onDestroy, onMount } from 'svelte';

	let show_map_force: boolean = true;

	export let fullscreen: boolean = false;
	export let enlarge_map: boolean = false;
	export let round_finished: boolean;

	let bluemap: BlueMapApp | null = null;

	let place_element: HTMLSelectElement;

	const places: { [key: string]: THREE.Vector2 } = {
		Nirethia: new THREE.Vector2(279, 232),
		Valyria: new THREE.Vector2(102620, -32210),
		Avalon: new THREE.Vector2(360, 22490),
		Qurumaa: new THREE.Vector2(-37850, 280),
		Norendor: new THREE.Vector2(250, -20840),
		Tesora: new THREE.Vector2(-4000, -10600),
		Farmania: new THREE.Vector2(-100000, 250),
		Erathon: new THREE.Vector2(-7200, 8800),
		Ossyria: new THREE.Vector2(-37300, -2100),
		'Nyaste nya': new THREE.Vector2(20000, 0)
	};

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

	const sleep = (ms: number, callback: Function) => {
		setTimeout(callback, ms);
	};

	async function ResizeMap(ev: Event, force?: boolean) {
		enlarge_map = force ?? !enlarge_map;
		await new Promise((r) => setTimeout(r, 50)); // budget ass solution

		dispatchEvent(new Event('resize'));

		// background dispatch to make sure it did get resized
		new Promise((r) => setTimeout(r, 250)).then(() => {
			dispatchEvent(new Event('resize'));
		});
	}
	const force_close = (ev: Event) => ResizeMap(ev, false);

	function handle_keyup(ev: KeyboardEvent) {
		switch (ev.key) {
			case 'm': {
				ResizeMap(ev);
				break;
			}
			case 'h': {
				show_map_force = !show_map_force;

				sleep(100, () => dispatchEvent(new Event('resize')));
				sleep(250, () => dispatchEvent(new Event('resize')));

				break;
			}
			case '0': {
				Game.reset_view();

				break;
			}
			case '1': {
				PlaceTeleport(Object.values(places)[0]);
				break;
			}
			case '2': {
				PlaceTeleport(Object.values(places)[1]);
				break;
			}
			case '3': {
				PlaceTeleport(Object.values(places)[2]);
				break;
			}
			case '4': {
				PlaceTeleport(Object.values(places)[3]);
				break;
			}
			case '5': {
				PlaceTeleport(Object.values(places)[4]);
				break;
			}
			case '6': {
				PlaceTeleport(Object.values(places)[7]);
				break;
			}
			case '7': {
				PlaceTeleport(Object.values(places)[8]);
				break;
			}
			case '8': {
				PlaceTeleport(Object.values(places)[9]);
				break;
			}
		}
	}

	onMount(() => {
		addEventListener('next_round', force_close);
		addEventListener('keyup', handle_keyup);
	});

	onDestroy(() => {
		removeEventListener('next_round', force_close);
		removeEventListener('keyup', handle_keyup);
	});

	let selected_place: string;
	function PlaceTeleport(vector?: THREE.Vector2) {
		const [x, z] = vector
			? [vector.x, vector.y]
			: selected_place.split(',').map((c) => Number(c.trim()));

		Game.move_camera_to_pos(new THREE.Vector2(x, z));

		// Reset
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
		class="mapcontainer pointer-events-none absolute bottom-0 right-0 flex aspect-video h-auto w-full flex-col items-center justify-center sm:w-4/6 md:w-3/6 lg:w-2/6"
	>
		{#if show_map_force}
			<div class="pointer-events-auto my-2 flex w-full items-center justify-center lg:hidden">
				<slot />
			</div>
		{/if}

		<div class="flex h-full w-full flex-1 flex-row-reverse">
			<div class="mapWrapper relative h-full w-full" class:hidden={!show_map_force}>
				<MapCore
					bind:bluemap
					on:mapInteraction={(event) => {
						if (round_finished) return;

						let pos = GetPosFromInteraction(event);
						if (pos) $current_pos = pos;

						if (!$current_pos) return;

						if (bluemap) {
							UpdatePOIMarker(bluemap, $current_pos);
						}
					}}
				/>

				<div
					class="pointer-events-none absolute left-0 top-0 m-2 flex flex-col items-start gap-2 py-1 text-xl"
				>
					<div class="flex items-center gap-2">
						<button
							on:click={async (ev) => await ResizeMap(ev)}
							title={enlarge_map ? 'Förminska kartan' : 'Förstora kartan'}
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
								Ingen position
							{/if}
						</p>
					</div>

					<select
						class="pointer-events-auto w-fit bg-black/70 p-1 px-2 text-gray-100"
						bind:value={selected_place}
						bind:this={place_element}
						on:change={() => PlaceTeleport()}
					>
						<option value="0, 0" disabled selected>Platser</option>

						{#each Object.keys(places) as place}
							<option value={places[place].x + ', ' + places[place].y}>{place}</option>
						{/each}
					</select>
				</div>
			</div>

			<button
				class="pointer-events-auto bg-gray-700 px-1 text-5xl font-bold text-white outline outline-4 outline-gray-900"
				on:click={() => (show_map_force = !show_map_force)}
			>
				{show_map_force ? '>' : '<'}
			</button>
		</div>
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
	}
</style>
