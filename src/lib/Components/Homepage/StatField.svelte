<script lang="ts">
	export let title: string;
	export let value: string | number;
</script>

<div class="statrow flex w-full items-center justify-between gap-8 px-2 py-1 text-xl md:text-3xl">
	<p>{title}:</p>
	<p>{value}</p>
</div>
