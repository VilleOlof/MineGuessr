<script lang="ts">
	export let value: unknown | undefined = undefined;
</script>

<span class="flex w-full max-w-sm flex-col border-[6px] border-[#1e1e1f] text-[#b1b2b5]">
	<span id="shadow" class="h-2 w-full bg-[#242425]"></span>
	<input
		{...$$restProps}
		bind:value
		on:*
		class="bg-[#313233] px-2 py-1 caret-[#3c8527] outline-none"
	/>
</span>
