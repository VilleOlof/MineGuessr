<script lang="ts">
	import type { MPClient } from '../Client';
	import Panorama from '$lib/Components/Panorama.svelte';

	export let client: MPClient;
	const panorama = client.current_panorama;
</script>

<Panorama bind:index={$panorama} />

<p
	class="pointer-events-none absolute bottom-0 left-0 m-1 text-sm text-white/80 md:text-base"
	title="Spelkod"
>
	{client.metadata.game_id}
</p>
