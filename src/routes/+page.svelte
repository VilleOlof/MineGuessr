<script lang="ts">
	import MenuInstruction from '$lib/Components/MenuInstruction.svelte';
	import Button from '$lib/Components/Button.svelte';
	import PopupWrapper from '$lib/Components/PopupWrapper.svelte';
	import Stats from '$lib/Components/Stats.svelte';
	import Info from '$lib/Components/Info.svelte';
	import Suggestion from '$lib/Components/Suggestion.svelte';
	import toast from 'svelte-french-toast';
	import { GetDiscordAvatarUrl, toast_style } from '$lib';
	import type { LayoutData } from './$types';
	import Header from '$lib/Components/Header.svelte';
	import { PUBLIC_MAP_URL } from '$env/static/public';

	export let data: LayoutData;

	let show_info = false;
	let show_stats = false;
	let show_suggestion = false;

	let login_count: number = 0;
	function increment_login() {
		login_count++;
		if (login_count >= 5) {
			window.location.href = '/panel';
		}

		setTimeout(() => {
			login_count--;
		}, 1000);
	}
</script>

<div
	class="container flex w-full flex-col items-center justify-start gap-6 p-2 text-white sm:w-3/4 lg:w-2/4"
>
	<Header />

	<p class="text-lg md:text-2xl">Guess the location from Minecraft world</p>

	<div class="instructions flex flex-col items-start justify-start gap-1">
		<MenuInstruction text="You're gonna get a randomized location" />
		<MenuInstruction text="Your goal is to use the map to guess right" />
		<MenuInstruction text="The closer to location, the more points you get!" />
		<MenuInstruction text="Exactly like the real GeoGuessr, but for Minecraft!" />
	</div>

	<div class="buttons flex items-center justify-between gap-4">
		<!-- Dont really wanna copy the Button component but these need better screen size adjusting specifically-->
		<button
			on:click={() => (location.href = '/play')}
			class="c-shadow flex items-center gap-2 rounded-sm bg-gray-700 px-4 py-1 text-sm shadow-cyan-400 transition-transform hover:-translate-x-1 hover:-translate-y-1 active:scale-90 sm:text-base md:text-2xl lg:text-3xl"
		>
			Play
		</button>
		<button
			on:click={() => (location.href = '/play?daily=true')}
			class="c-shadow flex items-center gap-2 rounded-sm bg-gray-700 px-4 py-1 text-sm shadow-cyan-400 transition-transform hover:-translate-x-1 hover:-translate-y-1 active:scale-90 sm:text-base md:text-2xl lg:text-3xl"
		>
			Daily
		</button>
		<button
			on:click={() => {
				if (data.user) {
					location.href = '/mp';
				} else {
					toast.error('You need to be logged in to play multiplayer!', {
						duration: 5000,
						style: toast_style
					});
				}
			}}
			class:mp-disabled={!data.user}
			class="c-shadow flex items-center gap-2 rounded-sm bg-gray-700 px-4 py-1 text-sm shadow-cyan-400 transition-transform hover:-translate-x-1 hover:-translate-y-1 active:scale-90 sm:text-base md:text-2xl lg:text-3xl"
		>
			Multiplayer
		</button>
		<button
			on:click={() => (location.href = '/top')}
			class="c-shadow flex items-center gap-2 rounded-sm bg-gray-700 px-4 py-1 text-sm shadow-cyan-400 transition-transform hover:-translate-x-1 hover:-translate-y-1 active:scale-90 sm:text-base md:text-2xl lg:text-3xl"
		>
			Top
		</button>

		<button
			on:click={() => (show_info = true)}
			class="c-shadow flex items-center gap-2 rounded-sm bg-gray-700 px-4 py-1 text-sm shadow-cyan-400 transition-transform hover:-translate-x-1 hover:-translate-y-1 active:scale-90 sm:text-base md:text-2xl lg:text-3xl"
		>
			?
		</button>
	</div>

	<button
		class="text-xl text-gray-300 underline underline-offset-4 transition-colors hover:text-cyan-400"
		on:click={() => (show_suggestion = !show_suggestion)}
		>Do you have suggestions on locations, or other?</button
	>

	<div
		class="credits md:text-md absolute bottom-0 left-0 m-2 flex flex-col items-start text-gray-400"
	>
		<p>
			Map from <a
				href={PUBLIC_MAP_URL}
				target="_blank"
				class="font-bold text-cyan-600 underline underline-offset-2 transition-colors hover:text-cyan-400"
				>{new URL(PUBLIC_MAP_URL).host}</a
			>
		</p>

		<p>
			Wanna host your own instance? Check it out on <a
				href="https://github.com/VilleOlof/90gqguessr"
				target="_blank"
				class="font-bold text-cyan-600 underline underline-offset-2 transition-colors hover:text-cyan-400"
				>Github</a
			>
		</p>
	</div>
</div>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="absolute bottom-0 right-0 m-4 flex gap-2 text-gray-400">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<svg
		xmlns="http://www.w3.org/2000/svg"
		height="24"
		viewBox="0 -960 960 960"
		width="24"
		fill="currentColor"
		role="button"
		tabindex="0"
		class="cursor-pointer transition-transform hover:scale-90 active:scale-105"
		on:click={() => (show_stats = true)}
		><path
			d="M80-120v-80h800v80H80Zm40-120v-280h120v280H120Zm200 0v-480h120v480H320Zm200 0v-360h120v360H520Zm200 0v-600h120v600H720Z"
		/></svg
	>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<p><span on:click={increment_login}>V</span>1.3.2</p>
</div>

{#if show_info}
	<PopupWrapper title="Info" on:click={() => (show_info = false)}>
		<Info />
	</PopupWrapper>
{:else if show_stats}
	<PopupWrapper title="Statistics" on:click={() => (show_stats = false)} mini={true}>
		<Stats />
	</PopupWrapper>
{:else if show_suggestion}
	<PopupWrapper
		title="Send in suggestions"
		on:click={() => (show_suggestion = !show_suggestion)}
		mini={true}
	>
		<Suggestion bind:open={show_suggestion} />
	</PopupWrapper>
{/if}

<div class="discordLogin absolute left-0 top-0 m-4 flex flex-col items-start gap-4">
	{#if data.user}
		{@const pfp_url = GetDiscordAvatarUrl(data.user.user_id, data.user.avatar)}

		<div class="flex items-center gap-4 text-3xl">
			<img src={pfp_url} alt="" class="h-12 w-12 rounded-full outline outline-2 outline-gray-700" />
			<p>
				@{data.user.username}
			</p>
		</div>

		<button
			on:click={async () => {
				await fetch('/discord/logout');
				location.reload();
			}}
			class="c-shadow bg-gray-800 px-4 shadow-cyan-600 transition-transform hover:-translate-x-1 hover:-translate-y-1 active:scale-90"
			>Log out</button
		>
	{:else}
		<Button
			on:click={async () => {
				try {
					const url = (await (await fetch('/discord/init')).json()).url;
					location.href = url;
				} catch (e) {
					console.error(e);
					toast.error('Something went wrong!', {
						duration: 5000,
						style: toast_style
					});
				}
			}}
		>
			<img src="/discord.svg" alt="" class="h-8 w-8" />
			Log in</Button
		>
	{/if}
</div>

<style>
	:global(.mp-disabled) {
		opacity: 0.5;
	}
</style>
