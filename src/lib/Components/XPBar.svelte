<script lang="ts">
	import type { Game } from '$lib/Game';
	import { fly } from 'svelte/transition';

	export let game: Game;

	let rounds = game.rounds;
	let curr_round = game.current_round;
</script>

<div
	class="xpWrapper pointer-events-none absolute left-0 top-0 flex w-full flex-col items-center justify-start p-2"
>
	<div class="xpbar pointer-events-auto flex h-8 w-1/2 bg-gray-900 p-1 shadow-lg md:w-1/4">
		{#each $rounds as round}
			{@const percentage = 100 / $rounds.length}
			<div
				class="h-full outline outline-gray-900 transition-colors"
				class:xp-finished={round.finished}
				class:xp-not_finished={!round.finished}
				style="width: {percentage}%;"
			></div>
		{/each}
	</div>

	<p
		class="pointer-events-auto absolute flex items-center text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,1)]"
		title="Runda"
	>
		{$curr_round + 1}
	</p>

	{#if $rounds[$curr_round].finished}
		<p
			class="m-2 bg-gray-800 px-2 py-1 text-2xl text-green-400 shadow-lg"
			transition:fly={{ y: -30 }}
		>
			<span class="text-gray-300">+</span>
			{$rounds[$curr_round].score}
		</p>
	{/if}
</div>
