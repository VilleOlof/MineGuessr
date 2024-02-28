<script lang="ts">
	import { MPClient } from '../Client';
	import Panorama from '$lib/Components/Panorama.svelte';
	import Map from '$lib/Components/Map.svelte';
	import { UpdatePOIMarker, current_pos, curr_bluemap } from '$lib';
	import * as THREE from 'three';
	import { Game } from '$lib/Game';
	import { get } from 'svelte/store';
	import GuessButton from '$lib/Components/GuessButton.svelte';
	import { onDestroy, onMount } from 'svelte';
	import XpBarMp from './XPBar_MP.svelte';

	export let client: MPClient;
	const state = client.state;
	const panorama = client.current_panorama;

	const self_guessed = client.self_guessed;
	const self_next_round = client.self_next_round_ready;
	const timelimit = client.current_timelimit;

	let markers_to_clear: string[] = [];

	$: round_over = $state === 'intermission';
	$: show_guess = $current_pos !== null && !round_over && !$self_guessed;
	$: show_next = round_over && !$self_next_round;

	const [players, round_index] = [client.players, client.round_index];
	$: curr_self_round = $players[client.metadata.player_id].rounds[$round_index];
	// ####

	const guess = async () => {
		const [x, z] = $current_pos !== null ? [$current_pos.x, $current_pos.z] : [0, 0];
		client.guess_location(new THREE.Vector2(x, z));
	};

	function over() {
		if (!round_over) return;

		const round_index = get(client.round_index);
		const players = get(client.players);

		let user_count: number = 0;
		for (const [_, data] of Object.entries(players)) {
			const round = data.rounds[round_index];
			const line_marker = Game.draw_line_to_guess(round.location, round.guess_location, user_count);

			const user_guess_marker = UpdatePOIMarker(
				get(curr_bluemap)!,
				new THREE.Vector3(round.guess_location.x, 100, round.guess_location.y),
				user_count
			);

			markers_to_clear.push(line_marker, user_guess_marker);
			user_count++;
		}

		const player = players[client.metadata.player_id];
		const round = player.rounds[round_index];

		const correct_marker = Game.place_correct_marker(round.location, user_count);
		Game.move_camera_to_pos(round.location);

		// current_pos is the user's guess
		markers_to_clear.push(correct_marker, 'current_pos');
	}

	$: {
		if (round_over) {
			over();
		}
	}

	function next_round() {
		const map = get(curr_bluemap);
		if (map) {
			// Remove markers
			for (let marker_id of markers_to_clear) {
				let marker = map.popupMarkerSet.markers.get(marker_id);
				if (marker) {
					map.popupMarkerSet.remove(marker);
				}
			}
		}

		// Reset recent clicked position
		$current_pos = null;
		Game.reset_view();
	}

	onMount(() => {
		addEventListener(MPClient.MPClientEvent.NEXT_ROUND, next_round);
	});

	onDestroy(() => {
		removeEventListener(MPClient.MPClientEvent.NEXT_ROUND, next_round);
	});
</script>

<Panorama bind:index={$panorama} />

<button
	class="rounds absolute left-0 top-0 aspect-square h-auto w-16 transition-transform hover:-rotate-6 hover:scale-110 active:scale-90 sm:w-24"
	title="Lämna spel"
	on:click={() => client.fancy_leave_game()}
>
	<img src="/Earth.webp" alt="Tillbaka" />
</button>

<Map fullscreen={false} stop_interaction={round_over || $self_guessed}>
	<div class="m-3">
		<GuessButton
			submit_guess={guess}
			next_round={() => client.next_round()}
			{show_guess}
			{show_next}
		/>
	</div>
</Map>

<XpBarMp {client} round={curr_self_round} />

<div
	class="pointer-events-none absolute bottom-0 left-0 z-10 hidden w-full items-start justify-center p-4 lg:bottom-0 lg:flex"
>
	<GuessButton
		submit_guess={guess}
		next_round={() => client.next_round()}
		{show_guess}
		{show_next}
	/>
</div>

<p
	class="pointer-events-none absolute bottom-0 left-0 m-1 bg-black/50 px-2 text-base text-white/80 md:text-xl"
	title="Spelkod"
>
	{client.metadata.game_id}
</p>

{#if $timelimit !== undefined && !$self_guessed}
	<div class="mp_danger pointer-events-none absolute z-20 h-screen w-screen animate-pulse"></div>
{/if}

<style>
	:global(.mp_danger) {
		/* https://cssgradient.io/ */
		background: rgb(255, 0, 0);
		background: linear-gradient(
			90deg,
			rgba(255, 0, 0, 0.25) 0%,
			rgba(255, 0, 0, 0) 15%,
			rgba(255, 0, 0, 0) 85%,
			rgba(255, 0, 0, 0.25) 100%
		);
	}

	@media screen and (max-width: 640px) {
		:global(.mp_danger) {
			background: rgb(255, 0, 0);
			background: linear-gradient(
				90deg,
				rgba(255, 0, 0, 0.25) 0%,
				rgba(255, 0, 0, 0) 25%,
				rgba(255, 0, 0, 0) 75%,
				rgba(255, 0, 0, 0.25) 100%
			);
		}
	}
</style>
