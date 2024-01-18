<script lang="ts">
	export let title: string;
	export let href: string;
</script>

<div class="top flex items-center justify-between">
	<h1 class="text-3xl">{title}</h1>
	<a
		{href}
		class="flex h-8 w-8 items-center justify-center bg-gray-900 text-2xl transition-transform hover:scale-95 active:scale-105"
		>{'>'}</a
	>
</div>

<div class="my-1 h-1 w-full bg-gray-950"></div>
