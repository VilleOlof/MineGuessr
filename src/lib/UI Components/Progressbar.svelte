<script lang="ts">
	export let value: number = 0;
	export let show_value: boolean = false;
</script>

<div class="flex w-full flex-col items-center gap-4">
	<div id="progress_bar" class="mcprogressbar flex h-12 w-full border-4 border-white p-1">
		<span id="progress" class="h-full bg-white transition-all" style={`width: ${value}%`}></span>
	</div>
	{#if show_value}
		<span class="text-3xl text-white">{value}%</span>
	{/if}
</div>
