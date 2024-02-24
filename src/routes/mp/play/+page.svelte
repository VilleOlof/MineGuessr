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
		Intermission,
		Lobby,
		Playing
	} from '$lib/multiplayer/Components';

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

			if (visibility_param === null) visibility_param = 'public';
			if (visibility_param !== 'public' && visibility_param !== 'private')
				visibility_param = 'public';

			client.create_game(data.random_locations, visibility_param as Visibility);
		}
	});
</script>

{#if $state === 'lobby'}
	<!-- Lobby -->
	<Lobby {client} />
{:else if $state === 'playing'}
	<!-- Playing-->
	<Playing />
{:else if $state === 'intermission'}
	<!-- Intermission -->
	<Intermission />
{:else if $state === 'finished'}
	<!-- Finished -->
	<Finished />
{:else if $state === 'aborted'}
	<!-- Aborted -->
	<Aborted />
{:else if $state === 'error'}
	<!-- Error -->
	<Error />
{:else if $state === 'establishing'}
	<Establishing />
{:else}
	<!-- Unknown -->
	<p>Unknown state: {$state}</p>
{/if}
