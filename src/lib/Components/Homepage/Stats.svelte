<script lang="ts">
	import StatField from './StatField.svelte';
	import { Stats } from '$lib/Stats';
	import { format_time } from '$lib';
	import Container from '$lib/UI Components/Container/Container.svelte';

	export let stat_open: boolean = false;
</script>

<Container bind:visible={stat_open}>
	<h2 class="text-5xl">Statistics</h2>

	<div class="rows flex flex-col rounded-sm [&>:nth-child(odd)]:bg-slate-800/25">
		<StatField title="Total games" value={$Stats.games_played} />
		<StatField title="Total games finished" value={$Stats.games_finished} />
		<StatField title="Total points" value={$Stats.total_score} />
		<StatField title="Average points" value={Math.floor($Stats.average_score)} />
		<StatField title="Total distance" value={Math.floor($Stats.total_distance)} />
		<StatField title="Average distance" value={Math.floor($Stats.average_distance)} />
		<StatField title="Best round" value={$Stats.best_score} />
		<StatField title="Worst round" value={$Stats.worst_score} />
		<StatField title="Total time" value={format_time($Stats.total_time / 1000)} />
	</div>
</Container>
