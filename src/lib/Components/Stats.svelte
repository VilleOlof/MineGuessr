<script lang="ts">
	import StatRow from './StatRow.svelte';
	import { Stats } from '$lib/Stats';
	import { format_time } from '$lib';
</script>

<div class="rows flex flex-col [&>:nth-child(odd)]:bg-slate-800/25">
	<StatRow title="Total games" value={$Stats.games_played} />
	<StatRow title="Total games finished" value={$Stats.games_finished} />
	<StatRow title="Total points" value={$Stats.total_score} />
	<StatRow title="Average points" value={Math.floor($Stats.average_score)} />
	<StatRow title="Total distance" value={Math.floor($Stats.total_distance)} />
	<StatRow title="Average distance" value={Math.floor($Stats.average_distance)} />
	<StatRow title="Best round" value={$Stats.best_score} />
	<StatRow title="Worst round" value={$Stats.worst_score} />
	<StatRow title="Total time" value={format_time($Stats.total_time / 1000)} />
</div>
