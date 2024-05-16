<script lang="ts">
	import Map from '$lib/Components/Map.svelte';
	import type { MPClient } from '../Client';
	import type { PlayerData } from '../../../../shared/MP';
	import { Game } from '$lib/Game';
	import { GetDiscordAvatarUrl, UpdatePOIMarker, curr_bluemap, format_time } from '$lib';
	import { get } from 'svelte/store';
	import * as THREE from 'three';
	import EmptyContainer from '$lib/UI Components/Container/EmptyContainer.svelte';
	import MediumButton from '$lib/UI Components/Button/MediumButton.svelte';
	import SmallButton from '$lib/UI Components/Button/SmallButton.svelte';
	import { goto } from '$app/navigation';
	import { slide } from 'svelte/transition';
	import MenuButton from '$lib/Components/MenuButton.svelte';

	export let client: MPClient;
	export let self_username: string | undefined;

	const pre_players = client.players;
	const players = Object.entries($pre_players).sort(
		(a, b) => get_player_total(b[1]) - get_player_total(a[1])
	);

	let selected_other_player: string | null = null;

	let show_map: boolean = false;

	let markers_to_clear: string[] = [];
	function map() {
		show_map = true;

		let count = 0;
		for (const [_, player] of players) {
			for (const round of player.rounds) {
				let line = Game.draw_line_to_guess(round.location, round.guess_location, count);
				let correct = Game.place_correct_marker(round.location, count);

				markers_to_clear.push(line);
				markers_to_clear.push(correct);

				const discord_pfp = GetDiscordAvatarUrl(player.discord.user_id, player.discord.avatar);

				let bluemap = get(curr_bluemap);
				if (bluemap) {
					let vec3 = new THREE.Vector3(round.guess_location.x, 100, round.guess_location.y);
					let marker = UpdatePOIMarker(
						bluemap,
						vec3,
						count,
						discord_pfp,
						['discord_pin'],
						'center'
					);

					markers_to_clear.push(marker);
				}

				count++;
			}
		}
	}

	function clear() {
		let map = get(curr_bluemap);
		if (map) {
			for (const marker_id of markers_to_clear) {
				let marker = map.popupMarkerSet.markers.get(marker_id);
				if (marker) {
					map.popupMarkerSet.remove(marker);
				}
			}

			markers_to_clear = [];
		}
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
</script>

<Map fullscreen={true} stop_interaction={true} places={[]}></Map>

<!-- TODO: Better mobile transition within md, lg -->
{#if !show_map}
	{@const winner = players[0][1]}

	<div
		class="absolute left-0 top-0 z-10 flex h-full w-full items-center justify-center backdrop-blur-sm"
	>
		<span class="h-[95%] w-11/12 xl:h-[90%] xl:w-2/3">
			<EmptyContainer full={true}>
				<div
					class="flex h-full w-full flex-col items-center justify-start gap-4 overflow-scroll p-2 xl:flex-row"
				>
					<div class="flex h-fit w-full flex-col items-center justify-between gap-4">
						<div class="flex w-fit flex-col items-center justify-end gap-4">
							<div class="flex flex-col items-center">
								<h1 class="text-5xl sm:text-6xl md:text-8xl">Game ended</h1>
							</div>

							<div class="flex w-full items-center justify-center gap-4">
								<img
									src={GetDiscordAvatarUrl(winner.discord.user_id, winner.discord.avatar)}
									alt=""
									class="h-10 w-10 rounded-full xl:h-20 xl:w-20"
								/>
								<p
									style="color: rgb(99, 192, 17);"
									class="overflow-hidden text-ellipsis whitespace-nowrap text-4xl drop-shadow-lg sm:text-5xl md:text-6xl"
								>
									@{winner.discord.username}
								</p>
							</div>

							<div class="flex w-full justify-evenly gap-4">
								<p
									style="color: rgb(99, 192, 17);"
									class="font-MinecraftTen text-3xl drop-shadow-lg sm:text-4xl md:text-5xl"
								>
									{get_player_total(winner)}
								</p>
								<p class="text-3xl sm:text-4xl md:text-5xl">
									{format_time(get_player_total_time(winner) / 1000)}
								</p>
							</div>

							<div class="w-full">
								<!-- For some reason the data from /game/:id is just reversed :rdshrug: -->
								{#each winner.rounds as round, i}
									<div class="w-full text-3xl sm:text-4xl md:text-5xl">
										<div class="flex w-full items-center justify-start gap-4">
											<span class="w-fit text-2xl text-gray-500 sm:text-3xl md:text-4xl"
												>{i + 1}</span
											>
											<span style="color: rgb(85, 163, 16);" class="w-1/4 drop-shadow-sm"
												>{round.score}</span
											>
											<span class="flex w-2/3 justify-end text-2xl sm:text-3xl md:text-4xl"
												>{Math.floor(round.distance)} blocks</span
											>
										</div>

										{#if i !== winner.rounds.length - 1}
											<div class="h-1 w-full rounded-md bg-mc-standard-border"></div>
										{/if}
									</div>
								{/each}
							</div>
						</div>

						<div class="w-full">
							<!-- bit of an ugly way but these buttons kinda suck lmaooooo -->
							<div class="hidden w-full items-center justify-evenly md:flex">
								<MediumButton on:click={() => goto('/')}>Leave</MediumButton>
								<MediumButton on:click={map}>Map</MediumButton>
								<!-- <SmallButton on:click={() => share(total_points, game)}>Share</SmallButton> -->
							</div>

							<div class="flex w-full items-center justify-evenly md:hidden">
								<SmallButton on:click={() => goto('/')}>Leave</SmallButton>
								<SmallButton on:click={map}>Map</SmallButton>
								<!-- <SmallButton on:click={() => share(total_points, game)}>Share</SmallButton> -->
							</div>
						</div>
					</div>

					<div class="flex h-full w-full flex-col items-center justify-end">
						<h2 class="text-6xl">Others</h2>

						<div class="flex h-5/6 w-11/12 flex-col border-[6px] border-[#1e1e1f] text-[#b1b2b5]">
							<span id="shadow" class="h-2 w-full bg-[#242425]"></span>

							<span
								class="h-full w-full overflow-scroll bg-[#313233] px-2 py-1 caret-[#3c8527] outline-none"
							>
								{#each players.filter(([_, p]) => p.discord.user_id !== winner.discord.user_id) as [id, player], i}
									<div>
										<div class="flex items-center justify-between overflow-hidden">
											<div
												class="flex max-w-44 items-center gap-4 text-lg text-white lg:text-3xl xl:max-w-80"
											>
												<span class="text-base text-mc-standard-bg xl:text-4xl">{i + 2}</span>
												<p
													class:self_user={player.discord.username === self_username}
													class="overflow-hidden text-ellipsis whitespace-nowrap"
												>
													{player.discord.username}
												</p>
											</div>

											<p class="text-lg xl:text-3xl">{get_player_total(player)}</p>

											<button
												on:click={() => {
													if (selected_other_player == id) {
														selected_other_player = null;
													} else {
														selected_other_player = id;
													}
												}}
												class="text-lg xl:text-4xl"
												>{selected_other_player === id ? 'Hide' : 'View'}</button
											>
										</div>

										{#if selected_other_player === id}
											<div transition:slide class="w-full rounded-sm bg-[#202021] px-2 py-1">
												<div class="flex items-center justify-between text-lg xl:text-4xl">
													<p class=" text-green-500">Total: {get_player_total(player)}</p>
													<p class=" text-green-500">
														Time: {format_time(get_player_total_time(player) / 1000)}s
													</p>
												</div>

												<div class="my-2 h-1 w-full bg-mc-standard-bg"></div>

												<div>
													{#each player.rounds as round, i}
														<div class="items center flex justify-between">
															<p class=" text-white">{i + 1}</p>
															<p class=" text-white">{round.score}</p>
															<p class=" text-white">{Math.floor(round.distance)} blocks</p>
														</div>
													{/each}
												</div>
											</div>
										{/if}

										{#if i !== players.filter(([_, p]) => p.discord.user_id !== winner.discord.user_id).length - 1}
											<div class="my-1 h-1 w-full bg-mc-standard-border"></div>
										{/if}
									</div>
								{/each}
							</span>
						</div>
					</div>
				</div>
			</EmptyContainer>
		</span>
	</div>
{/if}

<MenuButton
	override_onclick={show_map
		? () => {
				show_map = false;
				clear();
			}
		: null}
/>

<style>
	:global(.self_user) {
		color: rgb(99, 192, 17);
	}
</style>
