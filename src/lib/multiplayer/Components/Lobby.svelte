<script lang="ts">
	import { MPClient } from '../Client';
	import Header from '$lib/Components/Header.svelte';
	import toast from 'svelte-french-toast';
	import { GetDiscordAvatarUrl, toast_style } from '$lib';
	import { get } from 'svelte/store';

	export let client: MPClient;
	const players = client.players;

	let code_visible = client.metadata.visibility === 'public';

	function copy_code() {
		if (!client.metadata.game_id) return;
		navigator.clipboard.writeText(client.metadata.game_id);

		toast.success('Kopierade spelkoden!', {
			style: toast_style,
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
			toast.error('Changing ready status too quickly!', {
				style: toast_style,
				duration: 2000
			});
			return;
		}
		last_ready_change = new Date();

		const current_ready_status = get(client.players)[client.metadata.player_id].lobby_ready;

		client.change_ready_status(!current_ready_status);
	}
</script>

<Header />

<div class="flex flex-col text-slate-300">
	<h1 class="mb-4 text-3xl text-white">Multiplayer Lobby</h1>

	<div class="flex items-center gap-2">
		<p class="text-3xl">
			Game code: <span
				class="rounded-md px-1 text-white transition-all"
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
					class="h-full w-full hover:scale-95 hover:text-lime-400 active:scale-105"
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

		<button on:click={copy_code} title="Copy code">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				height="24"
				viewBox="0 -960 960 960"
				width="24"
				fill="currentColor"
				class="h-8 w-8 hover:scale-95 hover:text-yellow-400 active:scale-105 active:text-yellow-300"
				><path
					d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"
				/></svg
			>
		</button>
	</div>

	<p class="text-2xl">
		Visibility: <span class="text-white"
			>{client.metadata.visibility === 'public' ? 'Public' : 'Private'}</span
		>
	</p>

	<div class="my-4 h-1 w-full rounded-md bg-slate-700"></div>

	<p class="text-4xl">Players</p>
	<ul class="bg-slate-600 px-2 py-1">
		{#each Object.entries($players) as [_, data], i}
			<li class="flex items-center justify-between text-xl text-white">
				<span class="flex gap-2">
					<img
						src={GetDiscordAvatarUrl(data.discord.user_id, data.discord.avatar)}
						alt=""
						class="h-6 w-6 rounded-full"
					/>
					@{data.discord.username}
				</span>
				<span>
					{#if data.lobby_ready}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							height="24"
							viewBox="0 -960 960 960"
							width="24"
							fill="currentColor"
							class="text-lime-400"
							><path
								d="m424-312 282-282-56-56-226 226-114-114-56 56 170 170ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"
							/></svg
						>
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							height="24"
							viewBox="0 -960 960 960"
							width="24"
							fill="currentColor"
							class="text-red-400"
							><path
								d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Z"
							/></svg
						>
					{/if}
				</span>
			</li>

			{#if i !== Object.entries($players).length - 1}
				<div class="my-1 h-1 w-full rounded-md bg-slate-500"></div>
			{/if}
		{/each}
	</ul>

	<div class="my-4 h-1 w-full rounded-md bg-slate-700"></div>

	<div class="actions flex w-full gap-2 text-2xl text-white">
		<button
			on:click={() => client.fancy_leave_game()}
			title="Leave game"
			class="w-1/2 bg-slate-600 transition-all hover:scale-95 hover:bg-slate-500 active:scale-105"
			>Lämna</button
		>
		<button
			on:click={ready}
			title="Change ready status"
			class="w-1/2 bg-slate-600 transition-all hover:scale-95 hover:bg-slate-500 active:scale-105"
			>Redo</button
		>
	</div>
</div>

<style>
	:global(.hide_mp_lobby_code) {
		background: rgb(66, 83, 108);
		background: linear-gradient(233deg, rgba(66, 83, 108, 1) 0%, rgb(90, 102, 117) 100%);
		user-select: none;

		color: transparent !important;
	}
</style>
