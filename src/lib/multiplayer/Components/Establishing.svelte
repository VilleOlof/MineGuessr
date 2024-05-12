<script lang="ts">
	import Progressbar from '$lib/UI Components/Progressbar.svelte';
	import { onMount } from 'svelte';

	let progress: number = 0;

	onMount(() => {
		setTimeout(() => {
			progress = 12;
		}, 101);

		setTimeout(() => {
			progress = 31;
		}, 260);

		setTimeout(() => {
			progress = 47;
		}, 330);

		setTimeout(() => {
			progress = 47;
		}, 330);

		setTimeout(() => {
			progress = 63;
		}, 1012);

		setTimeout(() => {
			progress = 79;
		}, 1724);

		setTimeout(() => {
			progress = 97;
		}, 2038);

		setTimeout(() => {
			progress = 98;
		}, 2764);

		setTimeout(() => {
			progress = 99;
		}, 3623);
	});
</script>

<div class="flex w-full flex-col items-center justify-center px-2 md:w-1/2">
	<img src="/logo.svg" alt="MineGuessr" class="mb-12 w-full md:w-5/6" />

	<h1 class="my-4 text-center text-2xl sm:text-4xl">Trying to talk with the server...</h1>

	<Progressbar bind:value={progress} />
</div>
