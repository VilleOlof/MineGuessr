<script lang="ts">
	import type { MPClient } from '../Client';

	export let client: MPClient;
	let reason = client.error_abort_reason;
</script>

<div class=" flex flex-col items-center gap-4 text-5xl">
	<div class="actual flex items-center gap-4 text-4xl text-gray-400">
		<h1>"{$reason ?? 'Something??'}"</h1>
	</div>

	<p class="text-center">Ouch, The game ended abruptly :(</p>

	<div class="info flex flex-col items-center gap-3 text-xl text-gray-300">
		<p class="text-balance text-center">
			Don't worry! Click <a href="/mp" class="text-cyan-400 underline underline-offset-2">here</a>
			to get back!
		</p>
		<p class="text-balance text-center">Our bunnies have already reported your problem!</p>
	</div>
</div>
