<script lang="ts">
	import { format_time } from '$lib';
	import Label from '$lib/Components/Label.svelte';
	import { Game } from '$lib/Game';
	import { UserLabelPanel } from '$lib/userLabel';
	import type { PageData } from './$types';
	import PanelGoto from './components/PanelGoto.svelte';
	import PanelNav from './components/PanelNav.svelte';
	import PanelWrapper from './components/PanelWrapper.svelte';

	export let data: PageData;

	let label_username: string = '';
	let label_labels: string = '';
	let label_output: string = '';

	const labels = data.labels;
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

		<PanelWrapper>
			<PanelGoto title="Statistik" href="/panel/stats" />

			<h2 class="text-2xl"><span class="text-gray-300">Total Games:</span> {data.total_games}</h2>
			<h2 class="text-2xl">
				<span class="text-gray-300">Total Games (24h):</span>
				{data.games_24h}
			</h2>
			<h2 class="text-2xl"><span class="text-gray-300">Total Users:</span> {data.total_users}</h2>
		</PanelWrapper>

		<PanelWrapper>
			<PanelGoto title="Labels" href="/panel/labels" />

			<div class="input mb-4 flex w-full flex-col gap-2">
				<input
					class="bg-gray-800 px-2"
					type="text"
					placeholder="Username"
					bind:value={label_username}
				/>
				<input
					class="bg-gray-800 px-2"
					type="text"
					placeholder="Labels (x, x)"
					bind:value={label_labels}
					list="labels"
				/>

				<datalist id="labels">
					{#each Object.keys(labels) as label}
						<option value={label} />
					{/each}
				</datalist>
			</div>

			<h2 class="my-2 text-xl text-gray-200">Actions</h2>

			<div class="buttons flex flex-wrap items-start gap-2">
				<button
					on:click={async () => {
						label_output = JSON.stringify(await UserLabelPanel.Get(label_username), null, 2);
					}}
					class="bg-gray-800 px-4 py-1 transition-colors hover:bg-gray-900">Get</button
				>
				<button
					on:click={async () => {
						label_output = JSON.stringify(
							await UserLabelPanel.Set(label_username, label_labels.split(', ')),
							null,
							2
						);
					}}
					class="bg-gray-800 px-4 py-1 transition-colors hover:bg-gray-900">Set</button
				>
				<button
					on:click={async () => {
						await UserLabelPanel.Update(label_username, label_labels.split(', '));
						label_output = 'Updated successfully';
					}}
					class="bg-gray-800 px-4 py-1 transition-colors hover:bg-gray-900">Update</button
				>
				<button
					on:click={async () => {
						await UserLabelPanel.Remove(label_username, label_labels.split(', '));
						label_output = 'Removed successfully';
					}}
					class="bg-gray-800 px-4 py-1 transition-colors hover:bg-gray-900">Remove</button
				>
			</div>

			<textarea
				rows="4"
				class="my-2 w-full bg-gray-800 px-2"
				placeholder="Returned data"
				bind:value={label_output}
			></textarea>

			<h2 class="my-2 text-xl text-gray-200">Valid Labels</h2>
			<div class="labels flex flex-wrap gap-2">
				{#each Object.entries(labels) as [name, color]}
					<Label label={name} {color} />
				{/each}
			</div>
		</PanelWrapper>
	</div>
</div>
