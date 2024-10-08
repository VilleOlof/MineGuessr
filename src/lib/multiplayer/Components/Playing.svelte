<script lang="ts">
	import { MPClient } from '../Client';
	import Panorama from '$lib/Components/Panorama.svelte';
	import Map from '$lib/Components/Map.svelte';
	import { UpdatePOIMarker, current_pos, curr_bluemap, GetDiscordAvatarUrl } from '$lib';
	import * as THREE from 'three';
	import { Game } from '$lib/Game';
	import { get } from 'svelte/store';
	import GuessButton from '$lib/Components/GuessButton.svelte';
	import { onDestroy, onMount } from 'svelte';
	import XpBarMp from './XPBar_MP.svelte';
	import PlayerList from './PlayerList.svelte';
	import type { Place } from '$lib/server/places';
	import MenuButton from '$lib/Components/MenuButton.svelte';

	export let client: MPClient;
	export let places: Place[];
	const state = client.state;
	const panorama = client.current_panorama;

	const self_guessed = client.self_guessed;
	const self_next_round = client.self_next_round_ready;
	const timelimit = client.current_timelimit;

	const players_next_round = client.players_next_round;
	const players_guessed = client.players_guessed;

	let markers_to_clear: string[] = [];

	$: round_over = $state === 'intermission';
	$: show_guess = $current_pos !== null && !round_over && !$self_guessed;
	$: show_next = round_over && !$self_next_round;

	const [players, round_index] = [client.players, client.round_index];
	$: curr_self_round = $players[client.metadata.player_id].rounds[$round_index];
	// ####

	const guess = async () => {
		const [x, z] = $current_pos !== null ? [$current_pos.x, $current_pos.z] : [0, 0];
		client.guess_location(new THREE.Vector2(x, z));
	};

	function over() {
		if (!round_over) return;

		const round_index = get(client.round_index);
		const players = get(client.players);

		const map = get(curr_bluemap);
		if (map) {
			const curr_pos = map.popupMarkerSet.markers.get('current_pos');
			if (curr_pos) map.popupMarkerSet.remove(curr_pos);
		}

		let user_count: number = 0;
		for (const [_, data] of Object.entries(players)) {
			const round = data.rounds[round_index];
			const line_marker = Game.draw_line_to_guess(round.location, round.guess_location, user_count);

			const discord_pfp = GetDiscordAvatarUrl(data.discord.user_id, data.discord.avatar);

			const user_guess_marker = UpdatePOIMarker(
				get(curr_bluemap)!,
				new THREE.Vector3(round.guess_location.x, 100, round.guess_location.y),
				user_count,
				discord_pfp,
				['discord_pin'],
				'center'
			);

			markers_to_clear.push(line_marker, user_guess_marker);
			user_count++;
		}

		const player = players[client.metadata.player_id];
		const round = player.rounds[round_index];

		const correct_marker = Game.place_correct_marker(round.location, user_count);
		Game.lerp_camera_to_pos(round.location);

		// current_pos is the user's guess
		markers_to_clear.push(correct_marker, 'current_pos');
	}

	$: {
		if (round_over) {
			over();
		}
	}

	function next_round() {
		const map = get(curr_bluemap);
		if (map) {
			// Remove markers
			for (let marker_id of markers_to_clear) {
				let marker = map.popupMarkerSet.markers.get(marker_id);
				if (marker) {
					map.popupMarkerSet.remove(marker);
				}
			}
		}

		// Reset recent clicked position
		$current_pos = null;
		Game.reset_view();
	}

	const g_hotkey = () => {
		if (show_guess) {
			client.guess_location(new THREE.Vector2($current_pos?.x, $current_pos?.z));
		} else if (show_next) {
			client.next_round();
		}
	};

	function handle_keyup(ev: KeyboardEvent) {
		switch (ev.key) {
			case 'g': {
				g_hotkey();

				break;
			}
			case 'Enter': {
				g_hotkey();

				break;
			}
		}
	}

	onMount(() => {
		addEventListener(MPClient.MPClientEvent.NEXT_ROUND, next_round);
		addEventListener('keyup', handle_keyup);
	});

	onDestroy(() => {
		removeEventListener(MPClient.MPClientEvent.NEXT_ROUND, next_round);
		removeEventListener('keyup', handle_keyup);
	});
</script>

<Panorama bind:index={$panorama} />

<Map {places} fullscreen={false} stop_interaction={round_over || $self_guessed}>
	<span slot="button" class="w-full">
		<GuessButton
			submit_guess={guess}
			next_round={() => client.next_round()}
			{show_guess}
			{show_next}
			mp_wait={$self_guessed}
		/>
	</span>
</Map>

<XpBarMp {client} round={curr_self_round} />

<p
	class="pointer-events-none absolute bottom-0 left-0 m-1 rounded-sm bg-black/50 px-2 text-base text-white/80 md:text-xl"
	title="Game code"
>
	{client.metadata.game_id}
</p>

<PlayerList
	players={$players}
	next_round_checks={$players_next_round}
	guessed_checks={$players_guessed}
/>

<MenuButton override_onclick={() => client.fancy_leave_game()} />

{#if $timelimit !== undefined && !$self_guessed && $state === 'playing'}
	<div class="mp_danger pointer-events-none absolute z-20 h-screen w-screen animate-pulse"></div>
{/if}

<style>
	:global(.mp_danger) {
		/* https://cssgradient.io/ */
		background: rgb(255, 0, 0);
		background: linear-gradient(
			90deg,
			rgba(255, 0, 0, 0.25) 0%,
			rgba(255, 0, 0, 0) 15%,
			rgba(255, 0, 0, 0) 85%,
			rgba(255, 0, 0, 0.25) 100%
		);
	}

	@media screen and (max-width: 640px) {
		:global(.mp_danger) {
			background: rgb(255, 0, 0);
			background: linear-gradient(
				90deg,
				rgba(255, 0, 0, 0.25) 0%,
				rgba(255, 0, 0, 0) 25%,
				rgba(255, 0, 0, 0) 75%,
				rgba(255, 0, 0, 0.25) 100%
			);
		}
	}
</style>
