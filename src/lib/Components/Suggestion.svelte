<script lang="ts">
	import { toast_style } from '$lib';
	import toast from 'svelte-french-toast';

	export let open: boolean;

	let text: string;
	async function submit() {
		try {
			await fetch('/api/suggestion', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ text })
			});

			toast.success('Thanks for your idea!', {
				duration: 5000,
				style: toast_style
			});
		} catch (e) {
			console.error(e);

			toast.error('Something went wrong!', {
				duration: 5000,
				style: toast_style
			});
		}

		open = false;
	}
</script>

<p>
	Suggest an idea! <br />
	Like a new location, or if you want to report someone. <br />
	<br />
	<b>Important</b> <br />
	Make a
	<a
		class="underline transition-colors hover:text-cyan-400"
		href="https://github.com/VilleOlof/90gqguessr/issues">Github</a
	> issue if you want to suggest a feature or report a bug,
</p>

<textarea
	name=""
	id=""
	class="my-3 h-24 w-full bg-gray-900 p-1"
	placeholder="Write something here..."
	bind:value={text}
></textarea>

<div class="full flex w-full justify-center">
	<button
		on:click={async () => await submit()}
		class="flex items-center gap-2 bg-gray-900 p-2 text-xl text-white transition-transform hover:scale-90 active:scale-95"
		>Submit <svg
			xmlns="http://www.w3.org/2000/svg"
			height="24"
			viewBox="0 -960 960 960"
			width="24"
			fill="currentColor"
			><path
				d="m600-200-56-57 143-143H300q-75 0-127.5-52.5T120-580q0-75 52.5-127.5T300-760h20v80h-20q-42 0-71 29t-29 71q0 42 29 71t71 29h387L544-624l56-56 240 240-240 240Z"
			/></svg
		></button
	>
</div>
