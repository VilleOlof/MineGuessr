<script lang="ts">
	import { format_time } from '$lib';
	import { decrease_time, step_time } from '$lib/XPBarUtil';
	import { onDestroy, onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { ROUNDS_PER_MATCH } from '../../../../shared';
	import type { MPRound } from '../../../../shared/MP';
	import { MPClient } from '../Client';

	export let round: MPRound;
	export let client: MPClient;
	const round_index = client.round_index;
	const self_guessed = client.self_guessed;
	const timelimit = client.current_timelimit;

	const TIMER_UPDATE = 10;
	let timer_date: Date = new Date();
	function tick() {
		const [timer, time] = step_time(timer_date, round.time);

		round.time = time;
		timer_date = timer;
	}
	function timelimit_tick() {
		if ($timelimit === undefined) {
			$timelimit = undefined;
			clearInterval(timelimit_timer);
			return;
		}
		const [timer, time] = decrease_time(timer_date, $timelimit);
		console.log('Time since last tick', time);

		$timelimit = time;
		timer_date = timer;
	}

	let timer = setInterval(tick, TIMER_UPDATE);
	let timelimit_timer: NodeJS.Timeout;

	$: if (round.finished || $self_guessed) {
		clearInterval(timer);
	}

	const next_round = () => {
		console.log('next_round');

		$timelimit = undefined;
		clearInterval(timelimit_timer);
		clearInterval(timer);

		timer_date = new Date();
		timer = setInterval(tick, TIMER_UPDATE);
	};

	const timelimit_handle = () => {
		timer_date = new Date();
		clearInterval(timelimit_timer);
		timelimit_timer = setInterval(timelimit_tick, TIMER_UPDATE);
	};

	onMount(() => {
		addEventListener(MPClient.MPClientEvent.NEXT_ROUND, next_round);
		addEventListener(MPClient.MPClientEvent.TIMELIMIT, timelimit_handle);
	});

	onDestroy(() => {
		clearInterval(timer);
		clearInterval(timelimit_timer);
		removeEventListener(MPClient.MPClientEvent.NEXT_ROUND, next_round);
		removeEventListener(MPClient.MPClientEvent.TIMELIMIT, timelimit_handle);
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

	{#if $timelimit !== undefined}
		<!--TODO: this gets slow sometimes? usually after the first round? after another client triggers it?-->
		<p class="text-3xl text-red-600 drop-shadow-lg">{format_time($timelimit / 1000)}</p>
	{:else}
		<p class="text-3xl drop-shadow-lg">{format_time(round.time / 1000)}</p>
	{/if}

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
