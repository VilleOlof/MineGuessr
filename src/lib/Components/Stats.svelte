<script lang="ts">
	import StatRow from './StatRow.svelte';
	import { Stats } from '$lib/Stats';
	import { format_time } from '$lib';
</script>

<div class="rows flex flex-col [&>:nth-child(odd)]:bg-slate-800/25">
	<StatRow title="Totala spel" value={$Stats.games_played} />
	<StatRow title="Totala spel avklarat" value={$Stats.games_finished} />
	<StatRow title="Totala poäng" value={$Stats.total_score} />
	<StatRow title="Poäng i genomsnitt" value={Math.floor($Stats.average_score)} />
	<StatRow title="Totala distansen" value={Math.floor($Stats.total_distance)} />
	<StatRow title="Distans i genomsnitt" value={Math.floor($Stats.average_distance)} />
	<StatRow title="Bästa rundan" value={$Stats.best_score} />
	<StatRow title="Sämsta rundan" value={$Stats.worst_score} />
	<StatRow title="Totala tiden" value={format_time($Stats.total_time / 1000)} />
</div>
