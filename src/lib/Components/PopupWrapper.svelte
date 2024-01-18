<script lang="ts">
	import { fly } from 'svelte/transition';

	export let title: string;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div on:click class="blurryshader absolute left-0 top-0 z-10 h-full w-full backdrop-blur-sm"></div>

<div
	class="popup c-shadow absolute top-36 z-10 w-11/12 bg-gray-700 p-2 shadow-cyan-400 md:w-7/12 lg:w-4/12"
	transition:fly={{ y: 100, duration: 200, delay: 100 }}
>
	<header class="flex items-center justify-between">
		<h1 class="text-4xl font-bold">{title}</h1>

		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<svg
			xmlns="http://www.w3.org/2000/svg"
			height="24"
			viewBox="0 -960 960 960"
			width="24"
			role="button"
			tabindex="0"
			fill="currentColor"
			class="h-10 w-10 cursor-pointer transition-transform hover:scale-90 active:scale-105"
			on:click
			><path
				d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"
			/></svg
		>
	</header>

	<div class="divider my-4 h-1 w-full rounded-sm bg-gray-300"></div>

	<slot />
</div>
