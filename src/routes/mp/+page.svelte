<script lang="ts">
	import type { Visibility } from '../../../shared/MP';
	import { goto } from '$app/navigation';

	let game_name: string = '';
	let visibility: Visibility = 'public';
	function create_game() {
		goto(`/mp/play?visibility=${visibility}&game_name=${game_name}`);
	}
</script>

<div class="flex h-full w-full gap-4 p-4">
	<div class="left flex w-full flex-col items-end gap-4">
		<div class="info flex h-1/3 w-full flex-col items-center justify-center gap-4 p-4">
			<span class="flex gap-4">
				<img src="/Earth.webp" alt="Minecraft Earth" class="h-24 w-24" />
				<h1 class="text-8xl">Multiplayer</h1>
			</span>

			<p class="text-2xl text-gray-200">
				Compete against other players<br />
				to see who can guess the closest, the fastest!
			</p>
		</div>
		<div class="info flex h-2/3 w-full flex-col items-center justify-center gap-4">
			<h2 class="text-5xl">Create a new lobby</h2>

			<div class="inputs flex flex-col gap-4 text-2xl">
				<span class="flex flex-col">
					<p>Lobby name (?)</p>
					<input class="bg-gray-700 px-2" type="text" placeholder="..." bind:value={game_name} />
				</span>
				<span class="flex flex-col">
					<p>Game visibility</p>
					<select class="bg-gray-700 px-2 py-1" bind:value={visibility}>
						<option value="public">Public</option>
						<option value="private">Private</option>
					</select>
				</span>
			</div>

			<button
				on:click={create_game}
				class="c-shadow flex items-center gap-2 rounded-sm bg-gray-700 px-4 py-1 text-5xl shadow-cyan-400 transition-transform hover:-translate-x-1 hover:-translate-y-1 active:scale-90"
			>
				Create
			</button>
		</div>
	</div>

	<div class="right flex w-full flex-col items-start"></div>
</div>
