<script lang="ts">
	import type { MPClient } from '../Client';
	import Panorama from '$lib/Components/Panorama.svelte';
	import Map from '$lib/Components/Map.svelte';
	import Intermission from './Intermission.svelte';
	import { UpdatePOIMarker, current_pos, curr_bluemap } from '$lib';
	import * as THREE from 'three';
	import { Game } from '$lib/Game';
	import { get } from 'svelte/store';

	export let client: MPClient;
	const state = client.state;
	const panorama = client.current_panorama;

	function guess() {
		const [x, z] = $current_pos !== null ? [$current_pos.x, $current_pos.z] : [0, 0];
		client.guess_location(new THREE.Vector2(x, z));
	}

	$: round_over = $state === 'intermission';

	function over() {
		console.log('round over');

		const round_index = get(client.round_index);
		const players = get(client.players);
		console.log(round_index);

		let user_count: number = 0;
		for (const [_, data] of Object.entries(players)) {
			const round = data.rounds[round_index];
			console.log(round.score);

			Game.draw_line_to_guess(round.location, round.guess_location, user_count);
			Game.place_correct_marker(round.location, user_count);

			UpdatePOIMarker(
				get(curr_bluemap)!,
				new THREE.Vector3(round.guess_location.x, 100, round.guess_location.y),
				user_count
			);

			user_count++;
		}

		let player = players[client.metadata.player_id];
		console.log(player);
		Game.move_camera_to_pos(player.rounds[round_index].location);
	}

	$: {
		if (round_over) {
			// over();
		}
	}
</script>

<Panorama bind:index={$panorama} />

<Map fullscreen={round_over} round_finished={round_over}>
	<!-- <div class="m-3">
		<GuessButton {game} />
	</div> -->
</Map>

{#if !round_over}
	<button on:click={guess} class="absolute bottom-0 mb-8 bg-slate-800 px-4 py-1 text-5xl"
		>Gissa</button
	>
{/if}

{#if round_over}
	<Intermission />

	<button on:click={over} class="absolute bottom-0 mb-8 bg-slate-800 px-4 py-1 text-5xl"
		>SHOW</button
	>

	<button
		on:click={() => client.next_round()}
		class="absolute bottom-0 left-5 mb-8 bg-slate-800 px-4 py-1 text-5xl">NEXT</button
	>
{/if}

<p
	class="pointer-events-none absolute bottom-0 left-0 m-1 text-sm text-white/80 md:text-base"
	title="Spelkod"
>
	{client.metadata.game_id}
</p>
