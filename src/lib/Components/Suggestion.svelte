<script lang="ts">
	export let open: boolean;

	let text: string;
	async function submit() {
		await fetch('/api/suggestion', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ text })
		});

		open = false;
	}
</script>

<p>
	Föreslå en ide! <br />
	Kan vara allt från platser, förbättringar, buggar, etc.
</p>

<textarea
	name=""
	id=""
	class="my-3 h-24 w-full bg-gray-900 p-1"
	placeholder="Skriv något här..."
	bind:value={text}
></textarea>

<div class="full flex w-full justify-center">
	<button
		on:click={async () => await submit()}
		class="flex items-center gap-2 bg-gray-900 p-2 text-xl text-white transition-transform hover:scale-90 active:scale-95"
		>Skicka in <svg
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
