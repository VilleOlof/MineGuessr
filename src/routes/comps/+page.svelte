<script lang="ts">
	import Container from '$lib/UI Components/Container/Container.svelte';
	import MediumButton from '$lib/UI Components/Button/MediumButton.svelte';
	import EmptyContainer from '$lib/UI Components/Container/EmptyContainer.svelte';
	import Input from '$lib/UI Components/Input.svelte';
	import Toggle from '$lib/UI Components/Toggle.svelte';

	let popupVisible = false;

	/**
	 * Maybe make a whole new svelte lib with all sorts of minecraft-y components?
	 * More color options to components, shadows and highlights adjusting to the color.
	 * Toggles, Sliders, dropdowns, scrollbars, radio groups, etc.
	 */
</script>

<div class="flex h-full w-full items-center justify-center gap-8 bg-gray-400">
	<MediumButton on:click={() => (popupVisible = !popupVisible)}>Opens popup</MediumButton>
	<Container bind:visible={popupVisible}>
		<h1 slot="innerTitle">Info</h1>

		<h2 class="my-1 text-2xl font-bold">How does it work?</h2>
		<p class="md:text-xl">
			One game has 5 rounds in it. <br />
			For each round, you'll get a randomized location from the world. <br />
			Your task is to guess where you are in the world, using the map. <br />
			<br />
			You earn points based on how close you guessed. <br />
		</p>

		<h2 class="my-1 mt-4 text-2xl font-bold">Points system</h2>
		<p class="md:text-xl">
			If you're within 16 blocks of the location, you'll get 5000 points. <br />
			For each block away from the location, you lose 0.25 points. <br />
			The timer doesn't effect your points at all. <br />
		</p>

		<h2 class="my-1 mt-4 text-2xl font-bold">Daily mode</h2>
		<p class="md:text-xl">
			Each day, the places gets swapped out. <br />
			You can only play the daily mode once a day. <br />
			<br />
			This makes it easy to challenge your friends!
		</p>

		<h2 class="my-1 mt-4 text-2xl font-bold">Leaderboard</h2>
		<p class="md:text-xl">
			See who guesses the best! <br />
			Log in to get a spot on the leaderboard. <br />
			<br />
			First sorts after points, and then time. <br />
			Leaderboard doesn't include daily mode games.
		</p>

		<h2 class="my-1 mt-4 text-2xl font-bold">Hotkeys</h2>
		<p class="md:text-xl">
			<kbd>M</kbd> - Fullscreen/minimize map <br />
			<kbd>H</kbd> - Show/hide map <br />
			<kbd>G</kbd> - Guess/next <br />
			<kbd>0</kbd> - Reset camera <br />
			<kbd>1-8</kbd> - Teleport to x place (order in list) <br />
		</p>
	</Container>

	<EmptyContainer
		><div class="flex h-12">
			<span class="h-full w-12 bg-purple-500"></span>
			<span class="h-full w-12 bg-fuchsia-500"></span>
			<span class="h-full w-12 bg-blue-500"></span>
			<span class="h-full w-12 bg-cyan-500"></span>
		</div></EmptyContainer
	>

	<Input placeholder="Typey..."></Input>

	<Toggle></Toggle>
</div>
