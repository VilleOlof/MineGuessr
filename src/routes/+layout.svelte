<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { onMount } from 'svelte';
	import '../app.pcss';
	import { Toaster } from 'svelte-french-toast';
	import { browser } from '$app/environment';
	import { LatestUpdate, SendUpdatesToServer, Stats } from '$lib/Stats';
	import type { LayoutData } from './$types';
	import { afterNavigate } from '$app/navigation';
	import { clear_toasts } from '$lib/AdvancementToast';

	export let data: LayoutData;

	onMount(() => {
		if (browser && data.user !== null) {
			// if local storage is empty, set it from the server
			// but if there exists both on the client and server
			// check using the timestamp, and if the client doesnt have a timestamp or the server has a newer timestamp, update the client

			if (data.server_stats !== null) {
				if ($Stats.games_played === 0) {
					$Stats = data.server_stats;
				} else if (
					$LatestUpdate === null ||
					$LatestUpdate < data.server_stats.updated_at.getTime()
				) {
					$Stats = data.server_stats;
				}
			}

			SendUpdatesToServer();
			$Stats = $Stats;
		}
	});

	afterNavigate(() => {
		clear_toasts();
	});
</script>

<svelte:head>
	{#if env.PUBLIC_WORLD_NAME}
		<title>MineGuessr: {env.PUBLIC_WORLD_NAME}</title>
		<meta property="og:title" content="MineGuessr: {env.PUBLIC_WORLD_NAME}" />
	{:else}
		<title>MineGuessr</title>
		<meta property="og:title" content="MineGuessr" />
	{/if}

	<meta property="og:description" content="Like GeoGussr, but for Minecraft!" />
	<meta property="og:image" content="{env.PUBLIC_ORIGIN}/Earth.webp" />
	<meta property="og:url" content={env.PUBLIC_ORIGIN} />
	<meta content="#22c55e" name="theme-color" />
</svelte:head>

<main
	class="siteWrapper no-scrollbar flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-mc-text-black font-Minecraft text-gray-100"
>
	<slot />

	<span
		id="mc_adv_toaster"
		class="pointer-events-none absolute z-50 flex h-full w-full flex-col items-center justify-start gap-2 pt-5 font-Minecraft text-gray-100"
	></span>
</main>

{@html "<!-- What will today's adventure be? -->"}

<Toaster />

<style>
	:global(.c-shadow) {
		--offset: 4px;

		box-shadow: var(--offset) var(--offset) 0px -1px var(--tw-shadow-color);
		-webkit-box-shadow: var(--offset) var(--offset) 0px -1px var(--tw-shadow-color);
		-moz-box-shadow: var(--offset) var(--offset) 0px -1px var(--tw-shadow-color);
	}

	:global(.g-drop) {
		--offset: 8px;

		box-shadow: 0 var(--offset) 0px 0px var(--tw-shadow-color);
		-webkit-box-shadow: 0 var(--offset) 0px 0px var(--tw-shadow-color);
		-moz-box-shadow: 0 var(--offset) 0px 0px var(--tw-shadow-color);
	}

	:global(.xp-finished) {
		background-color: rgb(99, 192, 17);
	}
	:global(.ontop) {
		z-index: 10;
	}

	:global(.current_pos, .correct_pos) {
		padding: 0.5rem;
		font-size: 1.5rem;
		border-radius: 0.5rem;
	}

	:global(.discord_pin) {
		width: 4rem;
		height: 4rem;

		padding: 0.5rem;
	}

	:global(.discord_pin > img) {
		width: 100%;
		height: 100%;

		border-radius: 50%;
		filter: drop-shadow(0 0 0.5rem #00000057);
	}

	:global(.current_pos > img) {
		width: 100%;
		height: 100%;
	}
	:global(.correct_pos > img) {
		filter: invert(74%) sepia(88%) saturate(1208%) hue-rotate(72deg) brightness(101%) contrast(94%);
		width: 100%;
		height: 100%;
	}
</style>
