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

		<span id="container_close" class="absolute -right-12 top-0 text-5xl">
			<button
				on:click={() => (visible = false)}
				class="border-mc-standard-border text-mc-text-black flex w-fit flex-col border-[6px] text-xl"
			>
				<span
					class="bg-mc-standard-bg border-4 border-white px-4 py-1 font-bold transition-colors hover:bg-[#b1b2b5]"
					>X</span
				>
				<span id="shadow" class="bg-mc-standard-shadow h-2 w-full transition-all group-hover:h-0"
				></span>
			</button>
		</span>

		<div
			class="border-mc-standard-border flex max-h-[calc(100dvh-8rem)] w-fit max-w-7xl flex-col border-[6px] text-2xl"
		>
			<span
				class="bg-mc-standard-bg relative flex flex-col overflow-y-scroll border-4 border-white px-8 py-4 transition-colors group-active:bg-[#4bab30]"
			>
				<span class="text-6xl font-bold"><slot name="innerTitle" /></span>

				<slot /></span
			>
			<span id="shadow" class="bg-mc-standard-shadow h-4 w-full"></span>
		</div>
	</span>
{/if}
