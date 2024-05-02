<script lang="ts">
	import { GetDiscordAvatarUrl } from '$lib';
	import type { PlayerData } from '../../../../shared/MP';

	export let players: { [key: string]: PlayerData };
	export let client_player_id: string;
	export let next_round_checks: { [key: string]: boolean };
</script>

<div
	class="overlay pointer-events-none absolute right-0 top-0 m-4 flex flex-col gap-2 rounded-md bg-black/40 px-3 py-2"
>
	{#each Object.entries(players) as [id, data]}
		<span class="flex items-center gap-2 text-xl md:text-2xl">
			<img
				src={GetDiscordAvatarUrl(data.discord.user_id, data.discord.avatar)}
				alt=""
				class="h-10 w-10 rounded-full sm:h-6 sm:w-6 md:h-8 md:w-8"
			/>
			<span
				class="hidden max-w-24 overflow-hidden text-ellipsis whitespace-nowrap text-slate-300 sm:block md:max-w-48 lg:max-w-72 xl:max-w-96"
				class:user_green={id === client_player_id}
				class:user_next={next_round_checks[id]}>@{data.discord.username}</span
			>
		</span>
	{/each}
</div>

<style>
	:global(.user_green) {
		color: #6be77c;
	}

	:global(.user_next) {
		color: #f6e05e;
	}
</style>
