<script lang="ts">
	import { GetDiscordAvatarUrl } from '$lib';
	import type { PlayerData } from '../../../../shared/MP';

	export let players: { [key: string]: PlayerData };
	export let next_round_checks: { [key: string]: boolean };
	export let guessed_checks: { [key: string]: boolean };
</script>

<div
	class="overlay pointer-events-none absolute left-0 top-20 m-2 flex flex-col gap-4 rounded-md bg-black/40 px-3 py-2"
>
	{#each Object.entries(players) as [id, data]}
		<span class="flex items-center gap-2 text-xl md:text-2xl">
			<img
				src={GetDiscordAvatarUrl(data.discord.user_id, data.discord.avatar)}
				alt=""
				class="h-10 w-10 rounded-full"
				class:user_green={guessed_checks[id]}
				class:user_next={next_round_checks[id]}
			/>
		</span>
	{/each}
</div>

<style>
	:global(.user_green) {
		outline-color: #6be77c;
		outline-width: 0.25rem;
		outline-offset: 0.1rem;
		outline-style: solid;
	}

	:global(.user_next) {
		outline-color: #f3d840;
		outline-width: 0.25rem;
		outline-offset: 0.1rem;
		outline-style: solid;
	}
</style>
