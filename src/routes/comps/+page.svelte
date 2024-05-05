<script lang="ts">
	import Container from '$lib/UI Components/Container/Container.svelte';
	import MediumButton from '$lib/UI Components/Button/MediumButton.svelte';
	import EmptyContainer from '$lib/UI Components/Container/EmptyContainer.svelte';
	import Input from '$lib/UI Components/Input.svelte';
	import Toggle from '$lib/UI Components/Toggle.svelte';
	import RadioGroup from '$lib/UI Components/RadioGroup.svelte';
	import Progressbar from '$lib/UI Components/Progressbar.svelte';
	import Advancement from '$lib/UI Components/Advancement.svelte';
	import SmallButton from '$lib/UI Components/Button/SmallButton.svelte';
	import XlButton from '$lib/UI Components/Button/XLButton.svelte';
	import LargeButton from '$lib/UI Components/Button/LargeButton.svelte';

	let popupVisible = false;
	let progress_value = 33;

	/**
	 * Maybe make a whole new svelte lib with all sorts of minecraft-y components?
	 * More color options to components, shadows and highlights adjusting to the color.
	 * Toggles, Sliders, dropdowns, scrollbars, radio groups, etc.
	 */

	/**
	 * ElementPrimaryBG: #d0d1d5
	 * ElementPrimaryBorder: #ffffff
	 * ElementShadow: #5a535d
	 */
</script>

<div class="flex h-full w-full flex-col items-center justify-center gap-8 bg-gray-400">
	<h1 class="font-MinecraftTen text-7xl text-black/80">Minecraft Styled</h1>
	<MediumButton on:click={() => (popupVisible = !popupVisible)}>Opens popup</MediumButton>
	<div class="flex gap-4">
		<MediumButton color={[204, 61, 198]} text_color="white">Color-y</MediumButton>
		<MediumButton classes="font-MinecraftTen">Big Ten</MediumButton>
		<MediumButton color={[66, 138, 201]} text_color="white">Color-ye</MediumButton>
	</div>
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

	<div class="flex gap-4">
		<EmptyContainer
			><div class="flex h-12">
				<span class="h-full w-12 bg-purple-500"></span>
				<span class="h-full w-12 bg-fuchsia-500"></span>
				<span class="h-full w-12 bg-blue-500"></span>
				<span class="h-full w-12 bg-cyan-500"></span>
			</div></EmptyContainer
		>

		<Toggle
			onToggle={(state) => {
				progress_value = state ? 22 : 33;
			}}
		></Toggle>
	</div>

	<div class="flex items-start gap-4">
		<Input placeholder="Typey..." type="text" minlength="2" required></Input>
		<div class="w-96">
			<Progressbar value={progress_value} show_value={true}></Progressbar>
		</div>
	</div>

	<RadioGroup
		items={[
			['creative', 'Creative'],
			['survival', 'Survival'],
			['adventure', 'Adventure']
		]}
		value="creative"
	></RadioGroup>

	<div class="absolute left-1/2 top-0 m-2 -translate-x-1/2">
		<Advancement src="/Earth.webp"></Advancement>
	</div>
</div>
