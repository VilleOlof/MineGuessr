<script lang="ts">
	import { fade, fly } from 'svelte/transition';

	export let visible = true;
</script>

{#if visible}
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div
		on:click={() => (visible = false)}
		transition:fade={{ duration: 200, delay: 100 }}
		class="blurryshader absolute left-0 top-0 z-10 h-full w-full bg-black/40"
	></div>

	<span
		class="absolute z-20 flex flex-col text-[#1d1e22]"
		transition:fly={{ y: 100, duration: 200, delay: 100 }}
	>
		<span class="ml-10 text-6xl">
			<slot name="outerTitle" />
		</span>

		<span id="container_close" class="absolute -top-12 right-0 text-5xl lg:-right-12 lg:top-0">
			<button
				on:click={() => (visible = false)}
				class="flex w-fit flex-col border-[6px] border-mc-standard-border text-xl text-mc-text-black"
			>
				<span
					class="border-4 border-white bg-mc-standard-bg px-4 py-1 font-bold transition-colors hover:bg-[#b1b2b5]"
					>X</span
				>
				<span id="shadow" class="h-2 w-full bg-mc-standard-shadow transition-all group-hover:h-0"
				></span>
			</button>
		</span>

		<div
			class="flex max-h-[calc(100dvh-8rem)] w-fit max-w-7xl flex-col border-[6px] border-mc-standard-border text-2xl"
		>
			<span
				class="relative flex flex-col overflow-y-scroll border-4 border-white bg-mc-standard-bg px-8 py-4 transition-colors group-active:bg-[#4bab30]"
			>
				<span class="text-6xl font-bold"><slot name="innerTitle" /></span>

				<slot /></span
			>
			<span id="shadow" class="h-4 w-full bg-mc-standard-shadow"></span>
		</div>
	</span>
{/if}
