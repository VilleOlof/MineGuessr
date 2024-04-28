<script lang="ts">
	import { goto } from '$app/navigation';
	import { MPClient } from '$lib/multiplayer/Client';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { writable, type Writable } from 'svelte/store';
	import type { State, Visibility } from '../../../../shared/MP';
	import {
		Aborted,
		Error,
		Establishing,
		Finished,
		Lobby,
		Playing
	} from '$lib/multiplayer/Components';
	import { random_game_name } from '$lib/multiplayer/random_name';

	export let data: PageData;
	if (!data?.user || !data.auth || !data?.user?.userId) {
		goto('/');
	}

	let client: MPClient;
	let state: Writable<State> = writable('establishing');

	onMount(async () => {
		client = await MPClient.create(data.user!.userId, data.auth);
		state = client.state;

		if (data.game_id) client.join_game(data.game_id);
		else {
			let visibility_param = new URLSearchParams(window.location.search).get('visibility');
			let game_name_param = new URLSearchParams(window.location.search).get('game_name');

			if (visibility_param === null) visibility_param = 'public';
			if (visibility_param !== 'public' && visibility_param !== 'private')
				visibility_param = 'public';

			if (game_name_param === null || game_name_param === undefined || game_name_param === '')
				game_name_param = random_game_name();

			client.create_game(data.random_locations, visibility_param as Visibility, game_name_param);
		}

		if (!client.client_debug) {
			let url = new URL(window.location.href);
			url.searchParams.delete('visibility');
			url.searchParams.delete('game_id');
			window.history.replaceState({}, '', url.toString());
		}
	});
</script>

{#if $state === 'lobby'}
	<Lobby {client} />
{:else if $state === 'playing' || $state === 'intermission'}
	<Playing {client} places={data.places} />
{:else if $state === 'finished'}
	<Finished {client} />
{:else if $state === 'aborted'}
	<Aborted {client} />
{:else if $state === 'error'}
	<Error {client} />
{:else if $state === 'establishing'}
	<Establishing />
{:else}
	<p>Unknown state: {$state}</p>
{/if}
