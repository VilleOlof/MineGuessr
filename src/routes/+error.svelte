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

	<p>Ajdå, något gick fel :(</p>

	<div class="info flex flex-col items-center text-xl text-gray-300">
		<p>
			Oroa dig inte! Klicka <a href="/" class="text-cyan-400 underline underline-offset-2">här</a> för
			att komma tillbaka!
		</p>
		<p>Våra kaniner har redan rapporterat ditt problem!</p>
	</div>
</div>
