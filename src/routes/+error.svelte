<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class=" flex flex-col items-center gap-4 text-5xl">
	<div class="actual flex items-center gap-4 text-4xl text-gray-400">
		{#if $page.error}
			<h1>{$page.status}</h1>
			<p>{$page.error.message}</p>
		{:else}
			<h1>404</h1>
			<p>Page not found</p>
		{/if}
	</div>

	<p>Ouch, something went wrong :(</p>

	<div class="info flex flex-col items-center text-xl text-gray-300">
		<p>
			Don't worry! Click <a href="/" class="text-cyan-400 underline underline-offset-2">here</a> to get
			back!
		</p>
		<p>Our bunnies have already reported your problem!</p>
	</div>
</div>
