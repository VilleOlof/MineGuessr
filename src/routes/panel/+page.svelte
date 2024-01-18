<script lang="ts">
	import { format_time } from '$lib';
	import { Game } from '$lib/Game';
	import type { PageData } from './$types';
	import PanelGoto from './components/PanelGoto.svelte';
	import PanelNav from './components/PanelNav.svelte';
	import PanelWrapper from './components/PanelWrapper.svelte';

	export let data: PageData;
</script>

<div class="flex h-full w-full flex-col items-start justify-start gap-4 p-4">
	<PanelNav />

	<div class="flex h-full w-full flex-wrap gap-4">
		<PanelWrapper>
			<PanelGoto title="Suggestions" href="/panel/suggestions" />

			<div class="flex flex-col gap-2 bg-gray-800/50 p-1">
				{#each data.suggestions as suggestion}
					<p class="bg-gray-800 p-1">{suggestion.text}</p>
				{/each}
			</div>
		</PanelWrapper>

		<PanelWrapper>
			<PanelGoto title="Games" href="/panel/games" />

			<div class="flex flex-col gap-2 bg-gray-800/50 p-1">
				{#each data.games as game}
					<h2 class="bg-gray-800 p-1 text-gray-300">{game[0].game_id}</h2>
					<p class="w-full text-center text-base text-gray-400">{game[0].date.toLocaleString()}</p>

					<div class="round bg-gray-700">
						{#each game as round}
							<p class="text-gray-300">- {round.round_id}</p>

							<div class="coords flex gap-4">
								<p class="mx-2 w-1/2 text-green-400">x{round.location_x}, z{round.location_z}</p>
								<p class="mx-2 w-1/2 text-red-400">x{round.guess_x}, z{round.guess_z}</p>
							</div>

							<div class="info flex justify-center gap-2">
								<p class="w-1/3">{round.distance} Blocks</p>
								<p class="w-1/4">{format_time(round.time / 1000)}s</p>
								<p class="w-1/4">{Game.calculate_score(round.distance)} P</p>
							</div>

							<div class="h-1 w-full bg-gray-800"></div>
						{/each}
					</div>
				{/each}
			</div>
		</PanelWrapper>
	</div>
</div>
