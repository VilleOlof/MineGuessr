<!--
    This is kind of a special made button for the home menu mostly
    But its width is set to 100% and the text inside is items-start
-->

<script lang="ts">
	export let color: [number, number, number] = [208, 209, 213];
	export let text_color: 'white' | '#1d1e22' = '#1d1e22';

	export let shadow_color = color.map((c) => c - 118);
	// if its a pretty dark color, make the shadow color a bit lighter
	if (shadow_color.every((c) => c < 90)) {
		shadow_color[0] += 30;
		shadow_color[1] += 30;
		shadow_color[2] += 30;
	}

	const border_color = color.map((c) => c + 30);
	const hover_color = color.map((c) => c - 30);

	export let classes = '';
</script>

<span
	class="group flex w-full flex-col"
	style="--mcbc: rgb({color}); --mcsc: rgb({shadow_color}); --mcbbc: rgb({border_color}); --mchc: rgb({hover_color}); --mctc: {text_color};"
>
	<span id="shadow-balancer" class="h-0 w-full transition-all group-active:h-2"></span>
	<button
		on:click
		class="flex w-full flex-col border-[6px] border-[#28272a] text-[color:var(--mctc)] {classes}"
	>
		<span
			class="z-10 flex w-full items-center justify-start gap-2 border-4 border-[color:var(--mcbbc)] bg-[color:var(--mcbc)] px-6 py-2 transition-colors group-hover:bg-[color:var(--mchc)]"
			><slot /></span
		>
		<span id="shadow" class="h-2 w-full bg-[color:var(--mcsc)] transition-all group-active:h-0"
		></span>
	</button>
</span>
