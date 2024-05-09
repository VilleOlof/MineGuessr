<script lang="ts">
	import { goto } from '$app/navigation';
	import { PUBLIC_ORIGIN } from '$env/static/public';
	import { Discord, GameType, format_time } from '$lib';
	import { toast } from '$lib/AdvancementToast';
	import MediumButton from '$lib/UI Components/Button/MediumButton.svelte';
	import SmallButton from '$lib/UI Components/Button/SmallButton.svelte';
	import EmptyContainer from '$lib/UI Components/Container/EmptyContainer.svelte';
	import { GameModule } from '../../../shared/GameModule';
	import type { Game } from '$lib/Game';
	import type { LayoutData } from '../../routes/$types';
	import { share } from '$lib/share';

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
	<EmptyContainer>
		<div class="flex flex-col items-center justify-start gap-6 px-4 py-4 md:px-10">
			<div class="flex flex-col items-center">
				<h1 class="text-5xl sm:text-6xl md:text-8xl">Game ended</h1>

				{#if !data.user}
					<p class="text-lg text-mc-text-black md:text-2xl">
						<button
							on:click={Discord}
							class="underline underline-offset-2 transition-colors hover:text-lime-600"
							>Log in</button
						> to get a spot on the leaderboard!
					</p>
				{/if}
			</div>

			<div class="flex w-full items-end justify-evenly gap-4">
				<p
					style="color: rgb(99, 192, 17);"
					class="font-MinecraftTen text-5xl drop-shadow-lg sm:text-6xl md:text-7xl"
				>
					{total_points}
				</p>
				<p class="text-4xl sm:text-5xl md:text-6xl">{format_time(total_time / 1000)}</p>
			</div>

			<div class="w-full">
				{#each $rounds as round, i}
					<div class="w-full text-3xl sm:text-4xl md:text-5xl">
						<div class="flex w-full items-center justify-start gap-4">
							<span class="w-fit text-2xl text-gray-500 sm:text-3xl md:text-4xl">{i + 1}</span>
							<span style="color: rgb(85, 163, 16);" class="w-1/4 drop-shadow-sm"
								>{round.score}</span
							>
							<span class="flex w-2/3 justify-end text-2xl sm:text-3xl md:text-4xl"
								>{Math.floor(round.distance)} blocks</span
							>
						</div>

						{#if i !== $rounds.length}
							<div class="h-1 w-full rounded-md bg-mc-standard-border"></div>
						{/if}
					</div>
				{/each}
			</div>

			<div class="w-full">
				<!-- bit of an ugly way but these buttons kinda suck lmaooooo -->
				<div class="hidden w-full items-center justify-evenly md:flex">
					<MediumButton on:click={() => goto('/')}>Leave</MediumButton>
					<MediumButton
						on:click={() => {
							show_end_map = true;

							// Show all the guesses made
							game.draw_all_guess_lines();
						}}>Map</MediumButton
					>
					<SmallButton on:click={() => share(total_points, game)}>Share</SmallButton>
				</div>

				<div class="flex w-full items-center justify-evenly md:hidden">
					<SmallButton on:click={() => goto('/')}>Leave</SmallButton>
					<SmallButton
						on:click={() => {
							show_end_map = true;

							// Show all the guesses made
							game.draw_all_guess_lines();
						}}>Map</SmallButton
					>
					<SmallButton on:click={() => share(total_points, game)}>Share</SmallButton>
				</div>
			</div>
		</div>
	</EmptyContainer>
</div>
