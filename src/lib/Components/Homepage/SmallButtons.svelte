<script lang="ts">
	import SmallButton from '$lib/UI Components/Button/SmallButton.svelte';

	export let info_open = false;
	export let report_open = false;
</script>

<SmallButton on:click={() => (info_open = !info_open)}>Info</SmallButton>
<SmallButton on:click={() => (report_open = !report_open)}>Report</SmallButton>
<SmallButton on:click={() => (location.href = 'https://github.com/VilleOlof/MineGuessr')}
	>Github</SmallButton
>
