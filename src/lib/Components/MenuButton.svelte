<script lang="ts">
	import { goto } from '$app/navigation';
	import SmallButton from '$lib/UI Components/Button/SmallButton.svelte';

	export let override_onclick: (() => void) | null = null;
</script>

<div class="absolute left-0 top-0 z-10 m-2">
	<SmallButton
		on:click={() => {
			if (override_onclick) {
				override_onclick();
			} else {
				goto('/');
			}
		}}
	>
		<img src="left_arrow.png" alt="" style="image-rendering: pixelated;" class="w-6 py-1" />
	</SmallButton>
</div>
