<script lang="ts">
	import Panorama from '$lib/Components/Panorama.svelte';
	import { Game } from '$lib/Game';
	import type { PageData } from './$types';
	import Endscreen from '$lib/Components/Endscreen.svelte';
	import { writable, type Writable } from 'svelte/store';
	import confetti from 'canvas-confetti';
	import { onMount, onDestroy } from 'svelte';
	import { current_pos, GameType } from '$lib';
	import * as THREE from 'three';
	import MenuButton from '$lib/Components/MenuButton.svelte';
	import Map from '$lib/Components/Map.svelte';
	import GuessButton from '$lib/Components/GuessButton.svelte';
	import XPBar from '$lib/Components/XPBar.svelte';

	export let data: PageData;

	let game = Game.create(data.random_locations, data.daily ? GameType.Daily : GameType.Normal);

	let rounds = game.rounds;
	let curr_round = game.current_round;
	let game_finished = game.game_finished;
	$: curr_round_finished = $rounds[$curr_round].finished;

	let show_end_map: Writable<boolean> = writable(false);

	const perfect_guess = () =>
		confetti({
			particleCount: 150,
			spread: 100,
			origin: {
				y: 0.7
			},
			drift: 0.2
		});

	$: show_guess = $current_pos !== null && !$rounds[$curr_round].finished;
	$: show_next = $rounds[$curr_round].finished;
	const g_hotkey = () => {
		if (show_guess) {
			game.submit_guess(new THREE.Vector2($current_pos?.x, $current_pos?.z));
		} else if (show_next) {
			game.next_round();
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
		addEventListener('keyup', handle_keyup);
		addEventListener('perfect_guess', perfect_guess);
	});

	onDestroy(() => {
		removeEventListener('keyup', handle_keyup);
		removeEventListener('perfect_guess', perfect_guess);
	});

	const submit = async () =>
		await game.submit_guess(new THREE.Vector2($current_pos?.x, $current_pos?.z));
</script>

<!-- Just dont show the panorama when the map is in fullscreen, no need to load it -->
{#if !$game_finished}
	<Panorama bind:index={$rounds[$curr_round].panorama_id} />
{/if}

<Map places={data.places} fullscreen={$game_finished} stop_interaction={curr_round_finished}>
	<span slot="button" class="w-full">
		<GuessButton
			submit_guess={submit}
			next_round={() => game.next_round()}
			{show_guess}
			{show_next}
		/>
	</span>
</Map>

{#if !$game_finished}
	<XPBar {game} />
{/if}

{#if $game_finished && !$show_end_map}
	<Endscreen {data} {game} bind:show_end_map={$show_end_map} />
{/if}

<MenuButton
	override_onclick={$show_end_map
		? () => {
				show_end_map.set(false);
				game.clear_markers();
			}
		: null}
/>

<p
	class="pointer-events-none absolute bottom-0 left-0 m-1 text-sm text-white/80 md:text-base"
	title="Game id"
>
	{game.game_id}
</p>

<style>
	:global(.xp-finished) {
		background-color: rgb(99, 192, 17);
	}
	:global(.ontop) {
		z-index: 10;
	}
</style>
