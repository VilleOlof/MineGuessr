<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { BlueMapApp } from '$lib/BlueMap/BlueMapApp';
	import { loadLanguageSettings } from '$lib/i18n';
	import { curr_bluemap } from '$lib';

	let map_container: HTMLDivElement;
	export let bluemap: BlueMapApp | null = null;

	onMount(async () => {
		try {
			bluemap = new BlueMapApp(map_container);

			await loadLanguageSettings();

			await bluemap.load();
			bluemap.setFlatView(0);
			// Disable loading of hires tiles
			bluemap.mapViewer.data.loadedHiresViewDistance = 0;

			map_container.addEventListener('bluemapMapInteraction', (evt) => {
				dispatch('mapInteraction', {
					// @ts-ignore
					detail: evt.detail
				});
			});

			$curr_bluemap = bluemap;
		} catch (e) {
			console.error(e);
		}
	});

	let dispatch = createEventDispatcher();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	id="map-container"
	class="h-full w-full bg-slate-800 outline outline-4 outline-gray-900"
	bind:this={map_container}
	on:click
	on:mouseenter
	on:mouseleave
></div>
