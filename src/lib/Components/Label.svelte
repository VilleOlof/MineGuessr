<script lang="ts">
	import { UserLabel } from '$lib/userLabel';

	export let label: string = '';
</script>

<div class="w-min rounded-md px-2" style="background-color: {UserLabel.get_label_color(label)}">
	{label}
</div>
