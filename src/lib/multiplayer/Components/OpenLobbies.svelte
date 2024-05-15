<script lang="ts">
	import { goto } from '$app/navigation';

	export let lobbies;
</script>

<div id="mp_open_lobbies" class="flex h-full w-full flex-col items-center md:w-3/4 lg:w-full">
	<p class="text-4xl lg:text-5xl">Open lobbies</p>

	<div
		class="flex h-full w-full flex-col overflow-y-auto border-[6px] border-[#1e1e1f] text-[#b1b2b5]"
	>
		<span id="shadow" class="h-2 w-full bg-[#242425]"></span>

		<span class="h-full bg-[#313233] px-2 py-1 caret-[#3c8527] outline-none">
			{#each lobbies as lobby, i}
				<button
					id="mc_lobby_item"
					class="flex w-full cursor-pointer items-center justify-between gap-2 pl-2 text-2xl transition-colors hover:bg-[#1e1e1f] lg:text-3xl"
					on:click={() => goto(`/mp/play?game_id=${lobby.game_id}`)}
				>
					<div class="flex w-fit items-center gap-2 overflow-hidden">
						<p class="hidden text-base md:flex">{lobby.game_id}</p>
						<p class="whitespace-nowrap text-lg">
							{lobby.players.length} / {lobby.player_limit} :
						</p>
						<p class="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-green-500">
							{lobby.game_name}
						</p>
					</div>
					<p class="rounded-sm bg-[#1e1e1f] px-4">Join</p>
				</button>

				{#if i + 1 !== lobbies.length}
					<div class="my-1 h-1 w-full bg-mc-standard-border"></div>
				{/if}
			{/each}

			{#if lobbies.length === 0}
				<div
					class="flex h-full w-full items-center justify-center whitespace-nowrap px-1 text-3xl lg:text-5xl"
				>
					No open lobbies
				</div>
			{/if}
		</span>
	</div>
</div>
