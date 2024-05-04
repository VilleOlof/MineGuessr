<script lang="ts">
	export let placeholder: string = '';
	export let value: string = '';
</script>

<span class="flex max-w-sm flex-col border-[6px] border-[#1e1e1f] text-3xl text-[#b1b2b5]">
	<span id="shadow" class="h-2 w-full bg-[#242425]"></span>
	<input
		on:keydown
		on:focus
		bind:value
		{placeholder}
		class="bg-[#313233] px-6 py-3 caret-[#3c8527] outline-none"
	/>
</span>
