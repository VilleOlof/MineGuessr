<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="flex flex-col items-center gap-4 text-5xl">
	<img src="/logo.svg" alt="MineGuessr" class="mb-16 w-5/6" />

	<div class="actual flex items-center gap-4 text-4xl text-mc-standard-bg">
		{#if $page.error}
			<h1>{$page.status}</h1>
			<p>{$page.error.message}</p>
		{:else}
			<h1>404</h1>
			<p>Page not found</p>
		{/if}
	</div>

	<p
		class="rounded-sm px-4 py-2 text-center font-MinecraftTen"
		style="background-color: rgb(255, 56, 56, 0.5);"
	>
		Ouch, something went wrong :(
	</p>

	<div class="info flex flex-col items-center text-2xl text-mc-standard-bg">
		<p class="text-center">
			Don't worry! Click <a
				href="/"
				class="text-green-400 underline underline-offset-2 transition-colors hover:text-green-600"
				>here</a
			> to get back!
		</p>
		<p class="text-center">Our bunnies have already reported your problem!</p>
	</div>
</div>
