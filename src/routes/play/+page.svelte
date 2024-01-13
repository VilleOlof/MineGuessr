<script lang="ts">
	import Map from '$lib/Components/Map.svelte';
	import Panorama from '$lib/Components/Panorama.svelte';
	import { Game } from '$lib/Game';
	import type { PageData } from './$types';
	import { current_pos } from '$lib';
	import * as THREE from 'three';

	export let data: PageData;

	let game = new Game(data.random_locations);
	let rounds = game.rounds;
	let curr_round = game.current_round;

	rounds.subscribe(() => console.log($rounds));
</script>

<Panorama index={0} />

<Map />

<div
	class="absolute left-0 top-0 m-2 flex flex-col gap-2 rounded-md bg-gray-900 p-2 text-4xl font-bold text-cyan-400"
>
	<p>Round: {$curr_round + 1}</p>

	<p>
		{#if $current_pos}
			{$current_pos.x}, {$current_pos.y}
		{:else}
			No position
		{/if}
	</p>

	<div class="rounds flex flex-col gap-2 border border-cyan-200">
		{#each $rounds as round, i}
			{#if round.distance != 0}
				<p>Round: {i + 1}, score: {round.score}</p>
			{/if}
		{/each}
	</div>

	{#if $rounds[$curr_round].distance == 0}
		<button on:click={() => game.submit_guess(new THREE.Vector2($current_pos?.x, $current_pos?.z))}
			>Submit guess</button
		>
	{:else}
		<button on:click={() => game.next_round()}>Next round</button>
	{/if}
</div>

<p class="absolute bottom-0 left-0 m-1 text-white/80">{game.game_id}</p>
