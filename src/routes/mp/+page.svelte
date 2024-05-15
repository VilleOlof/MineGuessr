<script lang="ts">
	import type { Visibility } from '../../../shared/MP';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import { onDestroy, onMount } from 'svelte';
	import { MPClient } from '$lib/multiplayer/Client';
	import MenuButton from '$lib/Components/MenuButton.svelte';
	import Input from '$lib/UI Components/Input.svelte';
	import RadioGroup from '$lib/UI Components/RadioGroup.svelte';
	import Button from '$lib/UI Components/Button/Button.svelte';
	import SmallButton from '$lib/UI Components/Button/SmallButton.svelte';
	import OpenLobbies from '$lib/multiplayer/Components/OpenLobbies.svelte';

	export let data: PageData;
	let interval: NodeJS.Timeout;

	let game_name: string = '';
	let visibility: Visibility = 'public';
	let player_limit: number = 2;

	let game_code: string = '';

	function create_game() {
		goto(`/mp/play?visibility=${visibility}&game_name=${game_name}&player_limit=${player_limit}`);
	}

	function join_game() {
		if (game_code === '') return;
		goto(`/mp/play?game_id=${game_code}`);
	}

	function enter_join(event: CustomEvent<any>) {
		// stupid workaround
		if ((event as unknown as KeyboardEvent).key === 'Enter') join_game();
	}

	onMount(() => {
		interval = setInterval(async () => {
			data.lobbies = await MPClient.get_lobbies();
		}, 10 * 1000);
	});

	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<div
	class="flex h-full w-full flex-col items-center justify-start gap-8 overflow-y-scroll px-2 py-4 pt-20"
>
	<div class="flex gap-4">
		<h1 class="font-MinecraftTen text-5xl sm:text-7xl lg:text-8xl">Multiplayer</h1>
		<img
			src="/multiplayer_icon.webp"
			alt=""
			class="h-full w-auto"
			style="image-rendering: pixelated;"
		/>
	</div>

	<div
		id="mp_content"
		class="flex w-full flex-col items-start justify-start gap-4 lg:h-full lg:w-1/2 lg:flex-row lg:justify-center"
	>
		<div class="flex h-2/3 w-full flex-col items-center justify-between">
			<div
				id="mp_lobbycreate"
				class="flex w-full flex-col items-center gap-2 px-4 md:w-3/4 lg:w-full"
			>
				<p class="text-center text-4xl lg:text-5xl">Create new lobby</p>

				<div class="flex w-full items-center justify-between text-xl">
					<p class="text-2xl">Name</p>
					<span class="flex w-2/3 justify-end sm:w-full"
						><Input bind:value={game_name} placeholder="..." /></span
					>
				</div>

				<div class="flex w-full items-center justify-between text-xl">
					<p class="text-2xl">Limit</p>
					<span class="flex w-2/3 justify-end sm:w-full"
						><Input bind:value={player_limit} placeholder="Player limit" type="number" /></span
					>
				</div>

				<div class="flex w-full items-center justify-between text-xl">
					<p class="text-2xl">Visibility</p>
					<RadioGroup
						items={[
							['public', 'Public'],
							['private', 'Private']
						]}
						bind:value={visibility}
					/>
				</div>

				<Button classes="text-2xl sm:text-3xl" on:click={create_game}>
					<span class="flex w-full items-center justify-center">Create</span>
				</Button>
			</div>

			<span class="flex w-full items-center justify-center lg:hidden">
				<OpenLobbies lobbies={data.lobbies} />
			</span>

			<div id="mp_code_join" class="flex w-full flex-col items-center">
				<h2 class="ml-2 hidden w-full justify-center text-center text-4xl lg:flex lg:text-5xl">
					Join with code
				</h2>

				<div
					class="flex w-full items-center justify-between gap-4 text-3xl md:w-3/4 lg:w-full lg:justify-center"
				>
					<span class="w-2/3"
						><Input
							bind:value={game_code}
							placeholder="Game code..."
							on:keydown={enter_join}
						/></span
					>

					<SmallButton classes="text-base" on:click={join_game}>Join</SmallButton>
				</div>
			</div>
		</div>

		<span class="hidden h-full items-center justify-center lg:flex">
			<OpenLobbies lobbies={data.lobbies} />
		</span>
	</div>

	<MenuButton />
</div>
