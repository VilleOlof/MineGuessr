<script lang="ts">
	export let items: [string, string][] = [];
	export let value: string = '';
</script>

{#if items.length >= 2}
	<div id="radio_group" class="flex items-end">
		{#each items as [_value, name]}
			{@const is_selected = value === _value}

			<button
				on:click={() => (value = _value)}
				id="radio_opt"
				class="relative flex w-fit flex-col border-[6px] border-[#28272a] text-[#1d1e22]"
			>
				<span
					class="border-4 border-white bg-[#d0d1d5] px-4 py-1 text-4xl transition-colors hover:bg-[#b1b2b5]"
					class:mcradio_selected={is_selected}
					>{name}
					<span
						id="shadow_highlight"
						class="absolute bottom-0 left-1/2 h-1 w-2/6 -translate-x-1/2 bg-white opacity-0 transition-opacity"
						style={is_selected ? 'opacity: 1;' : ''}
					></span>
				</span>
				<span
					id="shadow"
					class="h-3 w-full bg-[#5a535d] transition-all"
					style={is_selected ? 'height: 0;' : ''}
				></span>
			</button>
		{/each}
	</div>
{/if}

<style>
	:global(.mcradio_selected) {
		/* This is stupid */
		background-color: #3c8527 !important;
		border-color: #639d52 !important;
		color: white;
	}
</style>
