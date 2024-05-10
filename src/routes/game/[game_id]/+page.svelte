<script lang="ts">
	import { Game } from '$lib/Game';
	import Map from '$lib/Components/Map.svelte';
	import type { PageData } from './$types';
	import Endscreen from '$lib/Components/Endscreen.svelte';
	import MenuButton from '$lib/Components/MenuButton.svelte';

	export let data: PageData;
	let show_end_map: boolean = false;

	let game_instance = Game.create_from_db(data.game_id, data.game);
</script>

<Map fullscreen={true} stop_interaction={false} places={data.places}></Map>

{#if !show_end_map}
	<Endscreen
		game={game_instance}
		bind:show_end_map
		{data}
		is_game_screen={true}
		game_screen_data={{ username: data.game[0].user?.username, date: data.game[0].date }}
	/>
{/if}

<MenuButton
	override_onclick={show_end_map
		? () => {
				show_end_map = false;
				game_instance.clear_markers();
			}
		: null}
/>
