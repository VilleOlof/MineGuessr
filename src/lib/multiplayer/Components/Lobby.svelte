<script lang="ts">
	import { MPClient } from '../Client';
	import { GetDiscordAvatarUrl } from '$lib';
	import { get } from 'svelte/store';
	import { PUBLIC_ORIGIN } from '$env/static/public';
	import Button from '$lib/UI Components/Button/Button.svelte';
	import { toast } from '$lib/AdvancementToast';

	export let client: MPClient;
	const players = client.players;

	let code_visible = client.metadata.visibility === 'public';

	function copy_link() {
		if (!client.metadata.game_id) return;
		navigator.clipboard.writeText(`${PUBLIC_ORIGIN}/mp/play/?game_id=${client.metadata.game_id}`);

		toast({
			title: 'Success!',
			description: 'Copied game link!',
			duration: 2000
		});
	}

	function copy_code() {
		if (!client.metadata.game_id) return;
		navigator.clipboard.writeText(client.metadata.game_id);

		toast({
			title: 'Success!',
			description: 'Copied game code!',
			duration: 2000
		});
	}

	let last_ready_change: Date | null = null;
	const ready_change_cooldown = 1000;
	function ready() {
		if (
			last_ready_change &&
			new Date().getTime() - last_ready_change.getTime() < ready_change_cooldown
		) {
			toast({
				title: 'Hold on!',
				description: 'Changing ready status too quickly!',
				duration: 2000
			});
			return;
		}
		last_ready_change = new Date();

		const current_ready_status = get(client.players)[client.metadata.player_id].lobby_ready;

		client.change_ready_status(!current_ready_status);
	}
</script>

<!-- <Header /> -->

<img src="/logo.svg" alt="MineGUessr" class="mb-8 w-11/12 md:w-8/12 lg:w-6/12 xl:w-4/12" />

<div class="flex flex-col text-mc-standard-bg">
	<!-- <img src="/logo.svg" alt="MineGUessr" class="mb-8 w-11/12" /> -->

	<h1 class="text-3xl text-white">Multiplayer Lobby</h1>

	<div class="mb-4 flex items-center gap-4">
		<p class="text-xl text-green-400/80">{client.metadata.game_name}</p>
		<p>{Object.keys($players).length} / {client.metadata.player_limit}</p>
	</div>

	<div class="flex items-center gap-2">
		<p class="text-3xl">
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			Game code:
			<span
				on:click={copy_code}
				class="cursor-pointer rounded-md px-1 text-white transition-all hover:text-slate-300"
				class:hide_mp_lobby_code={!code_visible}
				>{client.metadata.game_id ?? 'Loading game code...'}</span
			>
		</p>

		<button
			on:click={() => (code_visible = !code_visible)}
			title={code_visible ? 'Hide code' : 'Show code'}
			class="h-8 w-8 transition-colors"
		>
			{#if code_visible}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					height="24"
					viewBox="0 -960 960 960"
					width="24"
					fill="currentColor"
					class="h-full w-full hover:scale-95 hover:text-green-400 active:scale-105"
					><path
						d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z"
					/></svg
				>
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					height="24"
					viewBox="0 -960 960 960"
					width="24"
					fill="currentColor"
					class="h-full w-full hover:scale-95 hover:text-red-400 active:scale-105"
					><path
						d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z"
					/></svg
				>
			{/if}
		</button>

		<button on:click={copy_link} title="Copy code">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				height="24"
				viewBox="0 -960 960 960"
				width="24"
				fill="currentColor"
				class="h-8 w-8 hover:scale-95 hover:text-yellow-400 active:scale-105 active:text-yellow-300"
				><path
					d="M440-280H280q-83 0-141.5-58.5T80-480q0-83 58.5-141.5T280-680h160v80H280q-50 0-85 35t-35 85q0 50 35 85t85 35h160v80ZM320-440v-80h320v80H320Zm200 160v-80h160q50 0 85-35t35-85q0-50-35-85t-85-35H520v-80h160q83 0 141.5 58.5T880-480q0 83-58.5 141.5T680-280H520Z"
				/></svg
			>
		</button>
	</div>

	<p class="text-2xl">
		Visibility: <span class="text-white"
			>{client.metadata.visibility === 'public' ? 'Public' : 'Private'}</span
		>
	</p>

	<div class="my-4 h-1 w-full rounded-md bg-mc-standard-shadow"></div>

	<p class="mb-2 text-4xl">Players</p>
	<ul class="bg-[#121214] px-3 py-2">
		{#each Object.entries($players) as [_, data], i}
			<li
				class:mp_not_ready={!data.lobby_ready}
				class="flex items-center justify-between text-2xl text-white"
			>
				<span class="flex items-center gap-2">
					<img
						src={GetDiscordAvatarUrl(data.discord.user_id, data.discord.avatar)}
						alt=""
						class="h-7 w-7 rounded-full"
					/>
					@{data.discord.username}
				</span>
			</li>

			{#if i !== Object.entries($players).length - 1}
				<div class="my-3 h-1 w-full rounded-md bg-mc-standard-shadow/50"></div>
			{/if}
		{/each}
	</ul>

	<div class="my-4 h-1 w-full rounded-md bg-mc-standard-shadow"></div>

	<div class="actions flex w-full gap-2 text-3xl text-white">
		<Button on:click={() => client.fancy_leave_game()}>
			<span class="flex w-full justify-center">Leave</span>
		</Button>
		<Button on:click={ready}>
			<span class="flex w-full justify-center">Ready</span>
		</Button>
	</div>
</div>

<style>
	:global(.hide_mp_lobby_code) {
		background: rgb(66, 83, 108);
		background: linear-gradient(233deg, rgba(66, 83, 108, 1) 0%, rgb(90, 102, 117) 100%);
		user-select: none;

		color: transparent !important;
	}

	:global(.mp_not_ready) {
		opacity: 0.4;
	}
</style>
