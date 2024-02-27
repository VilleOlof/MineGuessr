<script lang="ts">
	import { current_pos } from '$lib';
	import type { Game } from '$lib/Game';
	import * as THREE from 'three';

	// export let game: Game;

	// let rounds = game.rounds;
	// let curr_round = game.current_round;

	// $: show_guess = $current_pos !== null && !$rounds[$curr_round].finished;
	// $: show_next = $rounds[$curr_round].finished;

	// const submit_guess = async () =>
	// 	await game.submit_guess(new THREE.Vector2($current_pos?.x, $current_pos?.z));

	export let submit_guess: () => Promise<void>;
	export let next_round: () => void;

	export let show_guess: boolean;
	export let show_next: boolean;
</script>

{#if show_guess}
	<button
		on:click={async () => await submit_guess()}
		class="g-drop pointer-events-auto flex border-4 border-gray-900 bg-gray-700 px-6 py-2 text-5xl shadow-gray-900 transition-transform hover:-translate-y-2 active:scale-90"
	>
		Gissa
	</button>
{:else if show_next}
	<button
		on:click={() => next_round()}
		class="g-drop pointer-events-auto flex border-4 border-gray-900 bg-gray-700 px-6 py-2 text-5xl shadow-gray-900 transition-transform hover:-translate-y-2 active:scale-90"
	>
		Vidare
	</button>
{/if}
