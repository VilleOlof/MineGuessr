<script lang="ts">
	import { GameType, format_time } from '$lib';
	import type { Game } from '$lib/Game';
	import EmptyContainer from '$lib/UI Components/Container/EmptyContainer.svelte';
	import { step_time } from '$lib/XPBarUtil';
	import { onDestroy, onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	export let game: Game;

	let rounds = game.rounds;
	let curr_round = game.current_round;

	const TIMER_UPDATE = 10;
	let timer_date: Date = new Date();
	function tick() {
		const [timer, time] = step_time(timer_date, $rounds[$curr_round].time);

		$rounds[$curr_round].time = time;
		timer_date = timer;
	}
	let timer = setInterval(tick, TIMER_UPDATE);

	$: if ($rounds[$curr_round].finished) {
		clearInterval(timer);
	}

	let next_round = () => {
		timer_date = new Date();
		timer = setInterval(tick, TIMER_UPDATE);
	};

	onMount(() => {
		addEventListener('next_round', next_round);
	});

	onDestroy(() => {
		clearInterval(timer);
		removeEventListener('next_round', next_round);
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
				{format_time($rounds[$curr_round].time / 1000)}
			</p>
			{#if game.game_type === GameType.Daily}
				<p class="text-4xl text-[#fae742] drop-shadow-[2px_2px_1px_#141414]">Daily</p>
			{/if}
		</span>

		<div class="pointer-events-auto relative flex h-16 w-[16rem] sm:h-20 sm:w-[20rem]">
			<EmptyContainer full={true}>
				<span class="flex h-full w-full gap-1 bg-white">
					{#each $rounds as round, i}
						{@const percentage = 100 / $rounds.length}
						<div
							class="flex h-full items-center justify-center transition-colors"
							class:xp-finished={round.finished}
							class:bg-mc-standard-bg={!round.finished}
							style="width: {percentage}%;"
						>
							{#if i == 2}
								<p
									class="pointer-events-auto font-MinecraftTen text-5xl text-mc-text-black"
									title="Round"
								>
									{$curr_round + 1}
								</p>
							{/if}
						</div>
					{/each}
				</span>
			</EmptyContainer>
		</div>
	</div>

	{#if $rounds[$curr_round].finished}
		{@const round = $rounds[$curr_round]}
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
