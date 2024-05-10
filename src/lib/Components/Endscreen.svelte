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

	export let is_game_screen: boolean = false;
	export let game_screen_data: { username: string | undefined; date: Date } | null = null;

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
				<h1 class="text-5xl sm:text-6xl md:text-8xl">
					{is_game_screen ? 'Game results' : 'Game ended'}
				</h1>

				{#if !data.user && !is_game_screen}
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
				<!-- For some reason the data from /game/:id is just reversed :rdshrug: -->
				{#each is_game_screen ? $rounds.reverse() : $rounds as round, i}
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

						{#if i !== $rounds.length - 1}
							<div class="h-1 w-full rounded-md bg-mc-standard-border"></div>
						{/if}
					</div>
				{/each}
			</div>

			{#if game_screen_data}
				<div class="flex flex-col items-center">
					{#if game.game_type === GameType.Daily}
						<p class="text-2xl text-[#fae742] drop-shadow-[2px_2px_1px_#141414] sm:text-3xl">
							Daily mode ({game_screen_data.date.getFullYear()}/{game_screen_data.date.getMonth() +
								1}/{game_screen_data.date.getDate()})
						</p>
					{:else}
						<p class="text-lg">
							{game_screen_data.date.toLocaleString()}
						</p>
					{/if}

					<div class="flex gap-4 text-2xl">
						<span class="text-mc-text-black/80">By:</span>
						{game_screen_data.username ? `@${game_screen_data.username}` : '???'}
					</div>

					<p class="text-sm text-gray-400">{game.game_id}</p>
				</div>
			{/if}

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
