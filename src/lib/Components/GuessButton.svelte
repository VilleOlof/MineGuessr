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
		on:click={() => game.submit_guess(new THREE.Vector2($current_pos?.x, $current_pos?.z))}
		class="pointer-events-auto flex bg-gray-900 px-6 py-2 align-middle text-5xl transition-transform hover:-translate-y-2 active:scale-90"
	>
		Gissa
	</button>
{:else if $rounds[$curr_round].finished}
	<button
		on:click={() => game.next_round()}
		class="pointer-events-auto flex bg-gray-900 px-6 py-2 text-5xl transition-transform hover:-translate-y-2 active:scale-90"
	>
		Vidare
	</button>
{/if}
