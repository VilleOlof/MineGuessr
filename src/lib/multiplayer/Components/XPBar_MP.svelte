<script lang="ts">
	import { format_time } from '$lib';
	import { decrease_time, step_time } from '$lib/XPBarUtil';
	import { onDestroy, onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { ROUNDS_PER_MATCH } from '../../../../shared';
	import type { MPRound } from '../../../../shared/MP';
	import { MPClient } from '../Client';
	import EmptyContainer from '$lib/UI Components/Container/EmptyContainer.svelte';

	export let round: MPRound;
	export let client: MPClient;
	const round_index = client.round_index;
	const self_guessed = client.self_guessed;
	const timelimit = client.current_timelimit;

	$: timelimit_active = $timelimit !== undefined;

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

		$timelimit = time;
		timer_date = timer;
	}

	let timer = setInterval(tick, TIMER_UPDATE);
	let timelimit_timer: NodeJS.Timeout;

	$: if (round.finished || $self_guessed || timelimit_active) {
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
	class="xpWrapper pointer-events-none absolute left-0 top-0 z-10 flex w-full flex-col items-end gap-2 p-2"
>
	<div
		class="flex w-full flex-col-reverse items-end justify-center gap-4 sm:flex-row sm:items-center sm:justify-end"
	>
		<span class="flex flex-col items-center">
			<p class="font-MinecraftTen text-5xl drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
				{#if $timelimit !== undefined}
					<p class=" text-red-600 drop-shadow-lg">{format_time($timelimit / 1000)}</p>
				{:else}
					<p class="drop-shadow-lg">{format_time(round.time / 1000)}</p>
				{/if}
			</p>
		</span>

		<div class="pointer-events-auto relative flex h-16 w-[16rem] sm:h-20 sm:w-[20rem]">
			<EmptyContainer full={true}>
				<span class="flex h-full w-full gap-1 bg-white">
					{#each client.get_rounds_completed() as state, i}
						{@const percentage = 100 / ROUNDS_PER_MATCH}
						<div
							class="flex h-full items-center justify-center transition-colors"
							class:xp-finished={state}
							class:bg-mc-standard-bg={!state}
							style="width: {percentage}%;"
						>
							{#if i == Math.floor(ROUNDS_PER_MATCH / 2)}
								<p
									class="pointer-events-auto font-MinecraftTen text-5xl text-mc-text-black"
									title="Round"
								>
									{$round_index + 1}
								</p>
							{/if}
						</div>
					{/each}
				</span>
			</EmptyContainer>
		</div>
	</div>

	{#if round.finished}
		<span transition:fly={{ y: -30 }} class="-z-10">
			<EmptyContainer>
				<p class="flex items-center gap-4 px-2 py-1 text-3xl text-mc-text-black">
					<span style="color: rgb(99, 192, 17);"
						><span class="text-mc-text-black">+</span>
						<span class="drop-shadow-[2px_2px_1px_#141414]">{round.score}</span></span
					>
					<span>({Math.floor(round.distance)} blocks)</span>
				</p>
			</EmptyContainer>
		</span>
	{/if}
</div>
