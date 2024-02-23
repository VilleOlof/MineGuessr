<script lang="ts">
	import type { MPClient } from '../Client';

	export let client: MPClient;
	const players = client.players;
</script>

<p>Game ID: {client.metadata.game_id}</p>

<p>Players:</p>
{#each Object.entries($players) as [player_id, data]}
	<p>{player_id} - {data.lobby_ready}</p>
{/each}
