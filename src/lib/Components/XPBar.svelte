<script lang="ts">
	import { format_time } from '$lib';
	import type { Game } from '$lib/Game';
	import { onDestroy } from 'svelte';
	import { fly } from 'svelte/transition';

	export let game: Game;

	let rounds = game.rounds;
	let curr_round = game.current_round;

	const TIMER_UPDATE = 10;
	let timer_date: Date = new Date();
	function step_time() {
		let now = new Date();
		let diff = now.getTime() - timer_date.getTime();
		let milliseconds = Math.floor(diff);

		$rounds[$curr_round].time += milliseconds;
		timer_date = now;
	}
	let timer = setInterval(step_time, TIMER_UPDATE);

	$: if ($rounds[$curr_round].finished) {
		clearInterval(timer);
	}
	addEventListener('next_round', () => {
		timer_date = new Date();
		timer = setInterval(step_time, TIMER_UPDATE);
	});

	onDestroy(() => {
		clearInterval(timer);
	});
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

	<p class="text-3xl drop-shadow-lg">{format_time($rounds[$curr_round].time / 1000)}</p>

	{#if $rounds[$curr_round].finished}
		{@const round = $rounds[$curr_round]}

		<p
			class="m-2 bg-gray-800 px-2 py-1 text-2xl text-green-400 shadow-lg"
			transition:fly={{ y: -30 }}
		>
			<span class="text-gray-300">+</span>
			{round.score} <span class="text-gray-200">({Math.floor(round.distance)} blocks)</span>
		</p>
	{/if}
</div>
