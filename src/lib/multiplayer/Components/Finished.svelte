<script lang="ts">
	import Map from '$lib/Components/Map.svelte';
	import type { MPClient } from '../Client';
	import type { PlayerData } from '../../../../shared/MP';
	import Button from '$lib/Components/Button.svelte';
	import { Game } from '$lib/Game';
	import { GetDiscordAvatarUrl, UpdatePOIMarker, curr_bluemap, format_time } from '$lib';
	import { get } from 'svelte/store';
	import * as THREE from 'three';

	export let client: MPClient;

	const players = client.players;

	let show_map: boolean = false;

	function get_winner(players: { [key: string]: PlayerData }) {
		let winner = '';
		let max_score = 0;

		for (const [_, player] of Object.entries(players)) {
			for (const round of player.rounds) {
				if (round.score > max_score) {
					max_score = round.score;
					winner = player.discord.username;
				}
			}
		}

		return winner || 'Nobody';
	}

	function get_player_total(player: PlayerData) {
		let total = 0;

		for (const round of player.rounds) {
			total += round.score;
		}

		return total;
	}

	function get_player_total_time(player: PlayerData) {
		let total = 0;

		for (const round of player.rounds) {
			total += round.time;
		}

		return total;
	}

	console.log($players);
</script>

<Map fullscreen={true} stop_interaction={true} places={[]}></Map>

{#if !show_map}
	<div
		class="absolute left-0 top-0 z-10 flex h-full w-full items-center justify-center backdrop-blur-sm"
	>
		<div
			class="end flex w-full flex-col items-center gap-4 bg-gray-900 px-2 py-6 sm:w-3/4 md:w-1/2 xl:w-2/5"
		>
			<h1 class="text-6xl font-bold">Result</h1>
			<p class="text-4xl">Winner: <span class="text-lime-400">{get_winner($players)}</span></p>

			<div class="players flex">
				{#each Object.entries($players) as [_, player]}
					<div class="mx-2 flex flex-col gap-4 bg-gray-800 px-2 py-4">
						<div class="user flex items-center gap-2">
							<img
								src={GetDiscordAvatarUrl(player.discord.user_id, player.discord.avatar)}
								alt=""
								class="h-10 w-10 rounded-full sm:h-6 sm:w-6 md:h-8 md:w-8"
							/>
							<p>{player.discord.username}</p>
						</div>

						<div class="mid">
							<p class="text-3xl">Total: {get_player_total(player)}</p>
							<p class="text-1xl">Time: {format_time(get_player_total_time(player) / 1000)}s</p>
						</div>

						<div class="flex flex-col gap-2 lg:text-2xl">
							{#each player.rounds as round, i}
								<p>
									<span class="text-gray-400">[{i + 1}]</span> -
									<span class="text-cyan-400">{round.score}</span>
									({Math.floor(round.distance)} blocks)
								</p>
							{/each}
						</div>
					</div>
				{/each}
			</div>

			<div class="buttons flex gap-4">
				<Button on:click={() => (location.href = '/mp')}>Play again</Button>
				<Button
					on:click={() => {
						show_map = true;

						let count = 0;
						for (const [_, player] of Object.entries($players)) {
							for (const round of player.rounds) {
								Game.draw_line_to_guess(round.location, round.guess_location, count);
								Game.place_correct_marker(round.location, count);

								let bluemap = get(curr_bluemap);
								if (bluemap) {
									let vec3 = new THREE.Vector3(round.guess_location.x, 100, round.guess_location.y);
									UpdatePOIMarker(bluemap, vec3, count);
								}

								count++;
							}
						}
					}}>Check map</Button
				>
				<!-- <Share game_id={game.game_id} {total_points} game_type={game.game_type} /> -->
			</div>
		</div>
	</div>
{:else}
	<button
		class="rounds absolute left-0 top-0 aspect-square h-auto w-16 transition-transform hover:-rotate-6 hover:scale-110 active:scale-90 sm:w-24"
		title="Back to the menu"
		on:click={() => (location.href = '/mp')}
	>
		<img src="/Earth.webp" alt="Back" />
	</button>
{/if}
