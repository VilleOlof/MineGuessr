<script lang="ts">
	import { toast } from '$lib/AdvancementToast';
	import SmallButton from '$lib/UI Components/Button/SmallButton.svelte';
	import Container from '$lib/UI Components/Container/Container.svelte';

	export let report_open: boolean = false;

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

			toast({
				title: 'Success',
				description: 'Suggestion submitted'
			});
		} catch (e) {
			console.error(e);

			toast({
				title: 'Error',
				description: 'Failed to submit suggestion'
			});
		}

		report_open = false;
	}
</script>

<Container bind:visible={report_open}>
	<p>
		Suggest an idea! <br />
		Like a new location, or if you want to report someone. <br />
		<br />
		<b>Important</b> <br />
		Make a
		<a
			class="underline transition-colors hover:text-cyan-400"
			href="https://github.com/VilleOlof/MineGuessr/issues">Github</a
		> issue if you want to suggest a feature or report a bug,
	</p>

	<textarea
		name=""
		id=""
		class="my-3 h-24 w-full rounded-sm bg-mc-standard-border p-1 px-2 text-white"
		placeholder="Write something here..."
		bind:value={text}
		on:keydown={(e) => e.stopPropagation()}
	></textarea>

	<div class="full flex w-full justify-center">
		<SmallButton on:click={async () => await submit()}>Submit</SmallButton>
	</div>
</Container>
