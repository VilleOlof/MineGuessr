<script lang="ts">
	import { PUBLIC_ORIGIN } from '$env/static/public';
	import { onMount } from 'svelte';
	import '../app.pcss';
	import { Toaster } from 'svelte-french-toast';
	import { browser } from '$app/environment';
	import { LatestUpdate, SendUpdatesToServer, Stats } from '$lib/Stats';
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	onMount(() => {
		if (browser && data.user !== null) {
			// if local storage is empty, set it from the server
			// but if there exists both on the client and server
			// check using the timestamp, and if the client doesnt have a timestamp or the server has a newer timestamp, update the client

			if ($Stats.games_played === 0) {
				$Stats = data.server_stats;
			} else if ($LatestUpdate === null || $LatestUpdate < data.server_stats.last_updated) {
				$Stats = data.server_stats;
			}

			SendUpdatesToServer();
		}
	});
</script>

<svelte:head>
	<title>90gQ Guessr</title>

	<meta property="og:title" content="90gQ Guessr" />
	<meta property="og:description" content="Liknande GeoGuessr, fast för minecraft servern 90gQ" />
	<meta property="og:image" content="{PUBLIC_ORIGIN}/Earth.webp" />
	<meta property="og:url" content={PUBLIC_ORIGIN} />
	<meta content="#22c55e" name="theme-color" />
</svelte:head>

<main
	class="siteWrapper no-scrollbar flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-gray-900 font-Minecraft text-gray-100"
>
	<slot />
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

	:global(.current_pos, .correct_pos) {
		padding: 0.5rem;
		font-size: 1.5rem;
		border-radius: 0.5rem;
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
