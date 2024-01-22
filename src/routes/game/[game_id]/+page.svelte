<script lang="ts">
	import { Game, type GameModule } from '$lib/Game';
	import Map from '$lib/Components/Map.svelte';
	import type { PageData } from './$types';
	import { curr_bluemap, format_time } from '$lib';
	import Button from '$lib/Components/Button.svelte';
	import Share from '$lib/Components/Share.svelte';
	import { PUBLIC_ORIGIN } from '$env/static/public';

	export let data: PageData;
	let show_popup: boolean = true;

	let game_instance = Game.create_from_db(data.game_id, data.game);
	const rounds = game_instance.rounds;

	$: total_points = $rounds.reduce((acc: number, curr: GameModule.Round) => acc + curr.score, 0);
	$: total_time = $rounds.reduce((acc: number, curr: GameModule.Round) => acc + curr.time, 0);
</script>

<Map fullscreen={true} {game_instance}></Map>

{#if show_popup}
	<div
		class="absolute left-0 top-0 z-10 flex h-full w-full items-center justify-center backdrop-blur-sm"
	>
		<div
			class="end flex w-full flex-col items-center gap-4 bg-gray-900 px-2 py-6 sm:w-3/4 md:w-1/2 xl:w-2/5"
		>
			<h1 class="text-gray-400">{data.game_id}</h1>
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
				<Button on:click={() => (location.href = '/')}>Menyn</Button>
				<Button
					on:click={() => {
						// Show all the guesses made
						if ($curr_bluemap) {
							game_instance.draw_all_guess_lines();
							show_popup = false;
						}
					}}>Kolla kartan</Button
				>
				<Share game_id={data.game_id} {total_points} />
			</div>
		</div>
	</div>
{:else}
	<button
		on:click={() => {
			show_popup = true;
			game_instance.clear_markers();
		}}
		class="g-drop pointer-events-auto absolute left-0 top-0 m-4 flex border-4 border-gray-900 bg-gray-700 px-6 py-2 text-4xl shadow-gray-900 transition-transform hover:-translate-y-2 active:scale-90"
		>Visa Resultat</button
	>
{/if}
