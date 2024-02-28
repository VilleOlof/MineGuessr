<script lang="ts">
	import { format_time } from '$lib';
	import { step_time } from '$lib/XPBarUtil';
	import { onDestroy, onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { ROUNDS_PER_MATCH } from '../../../../shared';
	import type { MPRound } from '../../../../shared/MP';
	import { MPClient } from '../Client';

	export let round: MPRound;
	export let client: MPClient;
	const round_index = client.round_index;
	const self_guessed = client.self_guessed;

	const TIMER_UPDATE = 10;
	let timer_date: Date = new Date();
	function tick() {
		const [timer, time] = step_time(timer_date, round.time);

		round.time = time;
		timer_date = timer;
	}
	let timer = setInterval(tick, TIMER_UPDATE);

	$: if (round.finished || $self_guessed) {
		clearInterval(timer);
	}

	let next_round = () => {
		timer_date = new Date();
		timer = setInterval(tick, TIMER_UPDATE);
	};

	onMount(() => {
		addEventListener(MPClient.MPClientEvent.NEXT_ROUND, next_round);
	});

	onDestroy(() => {
		clearInterval(timer);
		removeEventListener(MPClient.MPClientEvent.NEXT_ROUND, next_round);
	});
</script>

<div
	class="xpWrapper pointer-events-none absolute left-0 top-0 z-10 flex w-full flex-col items-center justify-start p-2"
>
	<div class="xpbar pointer-events-auto relative flex h-8 w-1/2 bg-gray-900 p-1 shadow-lg md:w-1/4">
		{#key $round_index}
			{#each client.get_rounds_completed() as state}
				{@const percentage = 100 / ROUNDS_PER_MATCH}
				<div
					class="h-full outline outline-gray-900 transition-colors"
					class:xp-finished={state}
					class:xp-not_finished={!state}
					style="width: {percentage}%;"
				></div>
			{/each}
		{/key}
	</div>

	<p
		class="pointer-events-auto absolute flex items-center text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,1)]"
		title="Runda"
	>
		{$round_index + 1}
	</p>

	<p class="text-3xl drop-shadow-lg">{format_time(round.time / 1000)}</p>

	{#if round.finished}
		<p
			class="m-2 bg-gray-800 px-2 py-1 text-2xl text-green-400 shadow-lg"
			transition:fly={{ y: -30 }}
		>
			<span class="text-gray-300">+</span>
			{round.score} <span class="text-gray-200">({Math.floor(round.distance)} blocks)</span>
		</p>
	{/if}
</div>

<style>
	:global(.xp-finished) {
		background-color: rgb(149, 204, 101);
	}
	:global(.xp-not_finished) {
		background-color: rgb(55 65 81);
	}
</style>
