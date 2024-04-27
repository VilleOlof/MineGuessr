<script lang="ts">
	import { Discord, format_time } from '$lib';
	import type { Game } from '$lib/Game';
	import { GameModule } from '../../../shared/GameModule';
	import type { LayoutData } from '../../routes/$types';
	import Button from './Button.svelte';
	import Share from './Share.svelte';

	export let data: LayoutData;

	export let game: Game;
	export let show_end_map: boolean;

	let rounds = game.rounds;

	$: total_points = $rounds.reduce((acc: number, curr: GameModule.Round) => acc + curr.score, 0);
	$: total_time = $rounds.reduce((acc: number, curr: GameModule.Round) => acc + curr.time, 0);
</script>

<div
	class="absolute left-0 top-0 z-10 flex h-full w-full items-center justify-center backdrop-blur-sm"
>
	<div
		class="end flex w-full flex-col items-center gap-4 bg-gray-900 px-2 py-6 sm:w-3/4 md:w-1/2 xl:w-2/5"
	>
		<h1 class="text-6xl font-bold">Resultat</h1>

		{#if !data.user}
			<p class="text-lg text-lime-300 md:text-2xl">
				<button
					on:click={Discord}
					class="underline underline-offset-4 transition-colors hover:text-lime-500"
					>Logga in</button
				> för att synas på topplistan!
			</p>
		{/if}

		<p class="text-4xl">Totalt: {total_points}</p>
		<p class="text-3xl">Tid: {format_time(total_time / 1000)}s</p>

		<div class="flex flex-col gap-2 text-2xl">
			{#each $rounds as round, i}
				<p>
					<span class="text-gray-400">[{i + 1}]</span> -
					<span class="text-cyan-400">{round.score}</span>
					({Math.floor(round.distance)} blocks)
				</p>
			{/each}
		</div>

		<div class="buttons flex gap-4">
			<Button on:click={() => (location.href = '/')}>Spela Igen</Button>
			<Button
				on:click={() => {
					show_end_map = true;

					// Show all the guesses made
					game.draw_all_guess_lines();
				}}>Kolla kartan</Button
			>
			<Share game_id={game.game_id} {total_points} game_type={game.game_type} />
		</div>
	</div>
</div>
