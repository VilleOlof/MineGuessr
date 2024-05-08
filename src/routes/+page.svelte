<script lang="ts">
	import Map from '$lib/Components/Map.svelte';
	import type { PageData } from './$types';
	import { PUBLIC_MAP_URL, PUBLIC_WORLD_NAME } from '$env/static/public';
	import MainButtons from '$lib/Components/Homepage/MainButtons.svelte';
	import SmallButtons from '$lib/Components/Homepage/SmallButtons.svelte';
	import Discord from '$lib/Components/Homepage/Discord.svelte';
	import Info from '$lib/Components/Homepage/Info.svelte';
	import Report from '$lib/Components/Homepage/Report.svelte';

	export let data: PageData;

	let info_open: boolean = false;
	let report_open: boolean = false;

	$: console.log(info_open, report_open);
</script>

<Map fullscreen={true} stop_interaction={true} places={[]} />

<div
	class="absolute left-0 top-0 flex h-full w-full flex-col items-center justify-center gap-8 overflow-hidden backdrop-blur-sm xl:flex-row-reverse xl:items-start xl:justify-between xl:p-8"
>
	<div class="m-8 flex flex-col items-center gap-2 xl:items-end">
		<img src="/logo.svg" alt="MineGuessr" class="w-11/12 drop-shadow-lg xl:w-full" />
		{#if PUBLIC_WORLD_NAME !== ''}
			<p class="rounded-md bg-mc-text-black/80 px-4 text-2xl drop-shadow-xl xl:text-4xl">
				World: {PUBLIC_WORLD_NAME}
			</p>
		{/if}
	</div>

	<div
		id="menu"
		class="flex h-fit w-full flex-col items-center gap-2 border-b-8 border-t-8 border-[#1e1e1f] bg-[#313233] py-6 sm:w-4/5 sm:border-l-8 sm:border-r-8 lg:w-3/5 xl:hidden"
	>
		<ul id="menubuttonlist" class="flex w-11/12 flex-col gap-2 text-3xl sm:text-4xl">
			<MainButtons size={10} mp_enabled={data.user !== null} />
		</ul>

		<ul id="smolmenubuttons" class="flex w-11/12 flex-wrap items-center justify-between gap-2">
			<SmallButtons bind:info_open bind:report_open />
		</ul>

		<div id="login" class="flex w-11/12">
			<Discord user={data.user} />
		</div>
	</div>

	<div
		id="desktop_menu"
		class="hidden h-full w-full flex-col items-start justify-center gap-16 xl:flex 2xl:w-3/5 2xl:pl-16"
	>
		<span
			id="bgskew"
			class="absolute left-0 top-0 -z-10 h-[200rem] w-2/3 -translate-x-96 -translate-y-16 -rotate-12 border-8 border-[#1e1e1f] bg-[#313233] drop-shadow-lg 2xl:w-1/3 2xl:-translate-x-16"
		></span>

		<ul id="menubuttonlist" class="flex w-fit flex-col gap-2 text-7xl">
			<MainButtons size={16} mp_enabled={data.user !== null} />
		</ul>

		<div class="bottom flex flex-col gap-4">
			<ul id="smolmenubuttons" class="flex w-fit items-center justify-start gap-2">
				<SmallButtons bind:info_open bind:report_open />
			</ul>

			<div id="login" class="flex w-11/12">
				<Discord user={data.user} />
			</div>
		</div>
	</div>
</div>

<Info bind:info_open />
<Report bind:report_open />

<div class="absolute bottom-0 left-0 flex w-full items-center justify-between p-2">
	<p>
		Map from <a
			href={PUBLIC_MAP_URL}
			target="_blank"
			class=" text-green-500 underline underline-offset-2 transition-colors hover:text-green-400"
			>{new URL(PUBLIC_MAP_URL).host}</a
		>
	</p>

	<div class="flex gap-2">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			height="24"
			viewBox="0 -960 960 960"
			width="24"
			fill="currentColor"
			role="button"
			tabindex="0"
			class="cursor-pointer transition-transform hover:scale-90 active:scale-105"
			><path
				d="M80-120v-80h800v80H80Zm40-120v-280h120v280H120Zm200 0v-480h120v480H320Zm200 0v-360h120v360H520Zm200 0v-600h120v600H720Z"
			/></svg
		>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<p>V1.3.2</p>
	</div>
</div>
