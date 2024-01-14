<script lang="ts">
	import type { Game, GameModule } from '$lib/Game';
	import Button from './Button.svelte';

	export let game: Game;
	export let show_end_map: boolean;

	let rounds = game.rounds;

	$: total_points = $rounds.reduce((acc: number, curr: GameModule.Round) => acc + curr.score, 0);
</script>

<div
	class="absolute left-0 top-0 z-10 flex h-full w-full items-center justify-center backdrop-blur-sm"
>
	<div class="end flex w-full flex-col items-center gap-4 bg-gray-900 px-2 py-6 lg:w-1/4">
		<h1 class="text-6xl font-bold">Resultat</h1>

		<p class="text-4xl">Totalt: {total_points}</p>

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
		</div>
	</div>
</div>
