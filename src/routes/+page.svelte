<script lang="ts">
	import MenuInstruction from '$lib/Components/MenuInstruction.svelte';
	import Button from '$lib/Components/Button.svelte';
	import PopupWrapper from '$lib/Components/PopupWrapper.svelte';

	let show_info = false;
	let show_stats = false;
</script>

<div
	class="container flex w-full flex-col items-center justify-start gap-6 p-2 text-white sm:w-3/4 lg:w-2/4"
>
	<header class="logo flex h-16 items-center gap-4 lg:h-24">
		<img
			src="/Earth.webp"
			alt="Minecraft Earth"
			class="h-full transition-transform hover:-translate-y-4 hover:-rotate-12"
		/>
		<h1 class="text-5xl font-bold md:text-6xl lg:text-7xl">90gQ Guessr</h1>
	</header>

	<p class="text-2xl">
		Gissa platsen från Minecraft servern <a
			href="https://90gq.se"
			target="_blank"
			class="font-bold text-cyan-400 underline underline-offset-2 transition-colors hover:text-cyan-200"
			>90gQ</a
		>
	</p>

	<div class="instructions flex flex-col items-start justify-start gap-1">
		<MenuInstruction text="Text that somehow easily describes the game" />
		<MenuInstruction text="Text that somehow easily describes the game" />
		<MenuInstruction text="Text that somehow easily describes the game" />
		<MenuInstruction text="Text that somehow easily describes the game" />
		<MenuInstruction text="Text that somehow easily describes the game" />
	</div>

	<div class="buttons flex items-center justify-between gap-4">
		<Button>Spela</Button>

		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<svg
			xmlns="http://www.w3.org/2000/svg"
			height="24"
			viewBox="0 -960 960 960"
			width="24"
			fill="currentColor"
			role="button"
			tabindex="0"
			class="c-shadow aspect-square h-10 w-10 cursor-pointer bg-gray-700 p-2 shadow-cyan-400 transition-transform hover:-translate-x-1 hover:-translate-y-1 active:scale-90"
			on:click={() => (show_info = true)}
			><path
				d="M424-320q0-81 14.5-116.5T500-514q41-36 62.5-62.5T584-637q0-41-27.5-68T480-732q-51 0-77.5 31T365-638l-103-44q21-64 77-111t141-47q105 0 161.5 58.5T698-641q0 50-21.5 85.5T609-475q-49 47-59.5 71.5T539-320H424Zm56 240q-33 0-56.5-23.5T400-160q0-33 23.5-56.5T480-240q33 0 56.5 23.5T560-160q0 33-23.5 56.5T480-80Z"
			/></svg
		>
	</div>

	<div class="credits flex flex-col items-center text-gray-400">
		<p>
			Karta från <a
				href="https://map.90gq.se"
				class="font-bold text-cyan-600 underline underline-offset-2 transition-colors hover:text-cyan-400"
				>map.90gq.se</a
			>
		</p>
		<p>
			Panorama screenshots från <a
				href="https://www.twitch.tv/liiindaa_"
				class="font-bold text-cyan-600 underline underline-offset-2 transition-colors hover:text-cyan-400"
				>Liiindaa</a
			>
		</p>
	</div>
</div>

<div class="absolute bottom-0 right-0 m-4 flex gap-2 text-gray-400">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<svg
		xmlns="http://www.w3.org/2000/svg"
		height="24"
		viewBox="0 -960 960 960"
		width="24"
		fill="currentColor"
		role="button"
		tabindex="0"
		class="cursor-pointer transition-transform hover:scale-90 active:scale-105"
		on:click={() => (show_stats = true)}
		><path
			d="M80-120v-80h800v80H80Zm40-120v-280h120v280H120Zm200 0v-480h120v480H320Zm200 0v-360h120v360H520Zm200 0v-600h120v600H720Z"
		/></svg
	>
	<p>V0.0.1</p>
</div>

{#if show_info}
	<PopupWrapper title="Info" on:click={() => (show_info = false)}>
		<!-- <Info /> -->
	</PopupWrapper>
{:else if show_stats}
	<PopupWrapper title="Statistik" on:click={() => (show_stats = false)}>
		<!-- <Stats /> -->
	</PopupWrapper>
{/if}
