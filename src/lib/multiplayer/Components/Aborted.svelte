<script lang="ts">
	import type { MPClient } from '../Client';

	export let client: MPClient;
	let reason = client.error_abort_reason;

	// Disconnect the client
	// to not be left in any weird state
	client.disconnect();
</script>

<div class=" flex flex-col items-center gap-4 text-5xl">
	<img src="/logo.svg" alt="MineGuessr" class="mb-16 w-5/6" />

	<div class="actual flex items-center gap-4 text-4xl text-mc-standard-bg">
		<h1>"{$reason ?? 'Something??'}"</h1>
	</div>

	<p
		class="rounded-sm px-4 py-2 text-center font-MinecraftTen"
		style="background-color: rgb(255, 56, 56, 0.5);"
	>
		Ouch, The game ended abruptly :(
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
