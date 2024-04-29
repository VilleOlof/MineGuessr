<script lang="ts">
	import type { Visibility } from '../../../shared/MP';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import { onDestroy, onMount } from 'svelte';
	import { MPClient } from '$lib/multiplayer/Client';
	import Button from '$lib/Components/Button.svelte';

	export let data: PageData;
	let interval: NodeJS.Timeout;

	let game_name: string = '';
	let visibility: Visibility = 'public';
	let player_limit: number = 2;

	let game_code: string = '';

	function create_game() {
		goto(`/mp/play?visibility=${visibility}&game_name=${game_name}&player_limit=${player_limit}`);
	}

	onMount(() => {
		// Fetch lobbies every minute
		interval = setInterval(
			async () => {
				data.lobbies = await MPClient.get_lobbies();
			},
			1 * 60 * 1000
		);
	});

	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<div class="flex h-full w-full gap-4 p-4">
	<div class="left flex w-full flex-col items-end gap-4">
		<div class="info flex h-1/3 w-full flex-col items-center justify-center gap-4 p-4">
			<span class="flex gap-4">
				<!-- Would look nice with some custom icon or something for MP-->
				<!-- <img src="/Earth.webp" alt="Minecraft Earth" class="h-24 w-24" /> -->
				<h1 class="text-8xl">Multiplayer</h1>
			</span>

			<p class="text-2xl text-gray-200">
				Compete against other players<br />
				to see who can guess the closest, the fastest!
			</p>
		</div>
		<div class="info flex h-2/3 w-full flex-col items-center justify-center gap-4">
			<h2 class="text-5xl">Create a new lobby</h2>

			<div class="inputs flex flex-col gap-4 text-3xl">
				<span class="flex flex-col">
					<p>Lobby name (?)</p>
					<input class="bg-gray-700 px-2" type="text" placeholder="..." bind:value={game_name} />
				</span>
				<span class="flex justify-between gap-2">
					<div class="flex flex-col">
						<p>Game visibility</p>
						<select class="bg-gray-700 px-2 py-1" bind:value={visibility}>
							<option value="public">Public</option>
							<option value="private">Private</option>
						</select>
					</div>

					<div class="flex flex-col">
						<p>Player limit</p>
						<input class="h-full w-32 bg-gray-700 px-2" type="number" bind:value={player_limit} />
					</div>
				</span>
			</div>

			<button
				on:click={create_game}
				class="c-shadow flex items-center gap-2 rounded-sm bg-gray-700 px-4 py-1 text-5xl shadow-cyan-400 transition-transform hover:-translate-x-1 hover:-translate-y-1 active:scale-90"
			>
				Create
			</button>
		</div>
	</div>

	<div class="right flex w-full flex-col items-center justify-center py-4">
		<h2 class="text-5xl">Join with code</h2>
		<div class="flex gap-4">
			<input
				class="bg-gray-700 px-2 text-xl"
				type="text"
				placeholder="code..."
				bind:value={game_code}
				on:keydown={(e) => {
					if (e.key === 'Enter') {
						if (game_code === '') return;
						goto(`/mp/play?game_id=${game_code}`);
					}
				}}
			/>
			<Button
				on:click={() => {
					if (game_code === '') return;
					goto(`/mp/play?game_id=${game_code}`);
				}}>Join</Button
			>
		</div>

		<div class="my-6 h-1 w-1/2 rounded-lg bg-slate-50/10"></div>

		<h2 class="my-4 text-5xl">Find open lobbies</h2>
		<div
			class="lobbybody c-shadow flex h-2/4 w-2/3 flex-col gap-2 overflow-y-auto bg-gray-950/50 p-2 shadow-gray-950/70 drop-shadow-lg"
		>
			{#each data.lobbies as lobby, i}
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div
					on:click={() => goto(`/mp/play?game_id=${lobby.game_id}`)}
					on:keydown={() => goto(`/mp/play?game_id=${lobby.game_id}`)}
					class="flex cursor-pointer items-center justify-between px-2 py-1 transition-colors hover:bg-gray-800"
				>
					<span class="flex items-center gap-4">
						<p class="text-gray-400">{lobby.game_id}</p>
						<p class="text-lg text-gray-200">{lobby.players.length} / {lobby.player_limit}</p>
						<p class="max-w-96 overflow-hidden text-ellipsis whitespace-nowrap text-3xl">
							{lobby.game_name}
						</p>
					</span>

					<button class="bg-gray-800 px-4 py-1">Join</button>
				</div>

				{#if i + 1 !== data.lobbies.length}
					<div class="h-1 w-full rounded-md bg-cyan-500/20"></div>
				{/if}
			{/each}
		</div>
	</div>
</div>

<a
	class="rounds absolute left-0 top-0 m-2 aspect-square h-auto w-16 transition-transform hover:-rotate-6 hover:scale-110 active:scale-90 sm:w-24"
	title="Back to the menu"
	href="/"
>
	<img src="/Earth.webp" alt="Back" />
</a>
