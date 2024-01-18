<script lang="ts">
	import MenuInstruction from '$lib/Components/MenuInstruction.svelte';
	import Button from '$lib/Components/Button.svelte';
	import PopupWrapper from '$lib/Components/PopupWrapper.svelte';
	import Stats from '$lib/Components/Stats.svelte';
	import Info from '$lib/Components/Info.svelte';
	import Suggestion from '$lib/Components/Suggestion.svelte';

	let show_info = false;
	let show_stats = false;
	let show_suggestion = false;
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
		<h1 class="text-5xl font-bold md:text-6xl xl:text-7xl">90gQ Guessr</h1>
	</header>

	<p class="text-lg md:text-2xl">
		Gissa platsen från Minecraft servern <a
			href="https://90gq.se"
			target="_blank"
			class="font-bold text-cyan-400 underline underline-offset-2 transition-colors hover:text-cyan-200"
			>90gQ</a
		>
	</p>

	<div class="instructions flex flex-col items-start justify-start gap-1">
		<MenuInstruction text="Du kommer få en slumpmässig plats" />
		<MenuInstruction text="Ditt mål är att använda kartan för att gissa rätt" />
		<MenuInstruction text="Desto nämre platsen, desto mer poäng får du!" />
		<MenuInstruction text="Exakt som riktiga GeoGuessr fast för 90gQ!" />
	</div>

	<div class="buttons flex items-center justify-between gap-4">
		<Button on:click={() => (location.href = '/play')}>Spela</Button>

		<Button on:click={() => (show_info = true)}>?</Button>
	</div>

	<button
		class="text-xl text-gray-300 underline underline-offset-4 transition-colors hover:text-cyan-400"
		on:click={() => (show_suggestion = !show_suggestion)}
		>Har du förslag på platser, eller annat?</button
	>

	<div
		class="credits md:text-md absolute bottom-0 left-0 m-2 flex flex-col items-start text-gray-400"
	>
		<p>
			Karta från <a
				href="https://map.90gq.se"
				target="_blank"
				class="font-bold text-cyan-600 underline underline-offset-2 transition-colors hover:text-cyan-400"
				>map.90gq.se</a
			>
		</p>
		<p>
			Panorama screenshots från <a
				href="https://www.twitch.tv/liiindaa_"
				target="_blank"
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
	<p>V1.1.0</p>
</div>

{#if show_info}
	<PopupWrapper title="Info" on:click={() => (show_info = false)}>
		<Info />
	</PopupWrapper>
{:else if show_stats}
	<PopupWrapper title="Statistik" on:click={() => (show_stats = false)}>
		<Stats />
	</PopupWrapper>
{:else if show_suggestion}
	<PopupWrapper title="Skicka in förslag" on:click={() => (show_suggestion = !show_suggestion)}>
		<Suggestion bind:open={show_suggestion} />
	</PopupWrapper>
{/if}
