<script lang="ts">
	export let value: boolean = false;
	export let onToggle: (value: boolean) => void = () => {};
</script>

<button
	{...$$restProps}
	role="switch"
	aria-label="Toggle"
	aria-checked={value}
	on:click={() => {
		value = !value;
		onToggle(value);
	}}
	class="relative flex items-end"
>
	<div id="enabled" class="flex h-16 w-[4.5rem] border-[6px] border-[#28272a]">
		<span
			class="flex h-full w-full items-center justify-center border-4 border-[#639d52] bg-[#3c8527]"
		>
			<span class="h-4/6 w-2 bg-white"></span>
		</span>
	</div>

	<div id="disabled" class="flex h-16 w-[4.5rem] border-[6px] border-[#28272a]">
		<span
			id="square_circle"
			class="flex h-full w-full flex-col items-center justify-center border-4 border-[#97989b] bg-[#8c8d90]"
		>
			<span class="h-1 w-[54%] bg-[#242425]"></span>
			<span class="flex h-4/6 w-full justify-center gap-7">
				<span class="h-full w-1 bg-[#242425]"></span>
				<span class="h-full w-1 bg-[#242425]"></span>
			</span>
			<span class="h-1 w-[54%] bg-[#242425]"></span>
		</span>
	</div>

	<div id="tracker" class="absolute flex">
		<span id="track_mover" class="h-20 transition-all" style="width: {!value ? '0' : '4.5rem'}">
		</span>
		<span class="flex h-20 w-[4.5rem] flex-col border-[6px] border-[#28272a] text-[#1d1e22]">
			<span class="h-full border-4 border-white bg-[#d0d1d5]"></span>
			<span id="shadow" class="h-3 w-full bg-[#5a535d]"></span>
		</span>
	</div>
</button>
