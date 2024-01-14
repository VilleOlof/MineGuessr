<script lang="ts">
	export let title: string;
	export let value: string | number;
</script>

<div class="statrow flex w-full items-center justify-between px-2 py-1 text-2xl">
	<p>{title}:</p>
	<p>{value}</p>
</div>
