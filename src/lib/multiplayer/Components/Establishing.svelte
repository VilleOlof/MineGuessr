<script lang="ts">
	import Progressbar from '$lib/UI Components/Progressbar.svelte';
	import { onMount } from 'svelte';

	const fun_facts: string[] = [
		'You can use your arrow keys to move the map in the main menu!',
		"Did you know that you can use the 'g' key to submit your guess?",
		"Did you know that you can use the 'Enter' key to submit your guess?",
		"Did you know that you can use the 'g' key to go to the next round?",
		"Did you know that you can use the 'Enter' key to go to the next round?",
		'i am speed',
		'sus',
		'glim glam is best pony',
		'wtf is a glim glam',
		'sub to @VilleOlof on YouTube!!!!',
		'vroom vroom',
		'*villager noises*',
		"you can't spell 'minecraft' without 'guessr'!",
		'some of these are lies :)',
		'nice',
		'you are doing great!',
		'you are doing great! (no, really)',
		'you are doing great! (no, really, you are)',
		'you are doing great! (no, really, you are, i promise)',
		'why are you still here?',
		'on a scale from 1 to 10, how are you feeling?',
		'remember to drink water!',
		'breathe in, breathe out',
		'lmao',
		'creeper aw man',
		'poggers',
		'are you a floorwegian?',
		'type 1 in chat if you see this',
		'magic trick! quick, think of a number between 1 and 10!'
	];

	let progress: number = 0;
	let random_change = Math.random() + 0.5;

	onMount(() => {
		setTimeout(() => {
			progress = 12;
		}, 101 * random_change);

		setTimeout(() => {
			progress = 31;
		}, 260 * random_change);

		setTimeout(() => {
			progress = 47;
		}, 330 * random_change);

		setTimeout(() => {
			progress = 47;
		}, 330 * random_change);

		setTimeout(() => {
			progress = 63;
		}, 1012 * random_change);

		setTimeout(() => {
			progress = 79;
		}, 1724 * random_change);

		setTimeout(() => {
			progress = 97;
		}, 2038 * random_change);

		setTimeout(() => {
			progress = 98;
		}, 2764 * random_change);

		setTimeout(() => {
			progress = 99;
		}, 3623 * random_change);
	});
</script>

<div class="flex w-full flex-col items-center justify-center px-2 md:w-1/2">
	<img src="/logo.svg" alt="MineGuessr" class="mb-12 w-full md:w-5/6" />

	<h1 class="my-4 text-center text-2xl sm:text-4xl">Trying to talk with the server...</h1>

	<Progressbar bind:value={progress} />

	<p class="mt-4 text-center text-2xl text-gray-400 sm:text-4xl">
		{fun_facts[Math.floor(Math.random() * fun_facts.length)]}
	</p>
</div>
