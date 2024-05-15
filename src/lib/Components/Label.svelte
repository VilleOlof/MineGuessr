<script lang="ts">
	export let label: string = '';
	export let color: string = '';
</script>

<div class="w-min rounded-md px-2 text-gray-300" style="background-color: {color}">
	{label}
</div>
