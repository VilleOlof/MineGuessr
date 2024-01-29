<script lang="ts">
	import Map from '$lib/Components/Map.svelte';
	import Panorama from '$lib/Components/Panorama.svelte';
	import { Game } from '$lib/Game';
	import type { PageData } from './$types';
	import Endscreen from '$lib/Components/Endscreen.svelte';
	import { writable, type Writable } from 'svelte/store';
	import confetti from 'canvas-confetti';
	import GuessButton from '$lib/Components/GuessButton.svelte';
	import XPBar from '$lib/Components/XPBar.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { current_pos, GameType } from '$lib';
	import * as THREE from 'three';

	export let data: PageData;

	let game = Game.create(data.random_locations, data.daily ? GameType.Daily : GameType.Normal);

	let rounds = game.rounds;
	let curr_round = game.current_round;
	let game_finished = game.game_finished;

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
</script>

<!-- Just dont show the panorama when the map is in fullscreen, no need to load it -->
{#if !$game_finished}
	<Panorama bind:index={$rounds[$curr_round].panorama_id} />
{/if}

<a
	class="rounds absolute left-0 top-0 aspect-square h-auto w-16 transition-transform hover:-rotate-6 hover:scale-110 active:scale-90 sm:w-24"
	title="Tillbaka till menyn"
	href="/"
	class:ontop={$show_end_map}
>
	<img src="/Earth.webp" alt="Tillbaka" />
</a>

<Map fullscreen={$game_finished} game_instance={game}>
	<div class="m-3">
		<GuessButton {game} />
	</div>
</Map>

{#if !$game_finished}
	<XPBar {game} />

	<div
		class="pointer-events-none absolute bottom-0 left-0 z-10 hidden w-full items-start justify-center p-4 lg:bottom-0 lg:flex"
	>
		<GuessButton {game} />
	</div>
{/if}

{#if $game_finished && !$show_end_map}
	<Endscreen {game} bind:show_end_map={$show_end_map} />
{/if}

<p
	class="pointer-events-none absolute bottom-0 left-0 m-1 text-sm text-white/80 md:text-base"
	title="Spel id"
>
	{game.game_id}
</p>

<style>
	:global(.xp-finished) {
		background-color: rgb(149, 204, 101);
	}
	:global(.xp-not_finished) {
		background-color: rgb(55 65 81);
	}
	:global(.ontop) {
		z-index: 10;
	}
</style>
