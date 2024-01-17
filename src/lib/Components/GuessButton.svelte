<script lang="ts">
	import { current_pos } from '$lib';
	import type { Game } from '$lib/Game';
	import * as THREE from 'three';

	export let game: Game;

	let rounds = game.rounds;
	let curr_round = game.current_round;
</script>

{#if $current_pos !== null && !$rounds[$curr_round].finished}
	<button
		on:click={async () =>
			await game.submit_guess(new THREE.Vector2($current_pos?.x, $current_pos?.z))}
		class="g-drop pointer-events-auto flex border-4 border-gray-900 bg-gray-700 px-6 py-2 text-5xl shadow-gray-900 transition-transform hover:-translate-y-2 active:scale-90"
	>
		Gissa
	</button>
{:else if $rounds[$curr_round].finished}
	<button
		on:click={() => game.next_round()}
		class="g-drop pointer-events-auto flex border-4 border-gray-900 bg-gray-700 px-6 py-2 text-5xl shadow-gray-900 transition-transform hover:-translate-y-2 active:scale-90"
	>
		Vidare
	</button>
{/if}

<style>
	:global(.g-drop) {
		--offset: 8px;

		box-shadow: 0 var(--offset) 0px 0px var(--tw-shadow-color);
		-webkit-box-shadow: 0 var(--offset) 0px 0px var(--tw-shadow-color);
		-moz-box-shadow: 0 var(--offset) 0px 0px var(--tw-shadow-color);
	}
</style>
