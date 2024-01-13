<script lang="ts">
	export let text: string;
</script>

<div
	class="instruction flex items-center gap-2 text-lg transition-transform hover:translate-x-3 md:text-xl lg:text-2xl"
>
	<div class="bar h-5 w-1 rounded-md bg-cyan-400"></div>
	<p>{text}</p>
</div>
