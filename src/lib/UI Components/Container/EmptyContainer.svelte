<script lang="ts">
	export let full = false;
</script>

<div
	class="flex w-fit flex-col border-[6px] border-[#28272a] text-[#1d1e22]"
	class:w-full={full}
	class:h-full={full}
>
	<span class="border-4 border-white bg-[#d0d1d5]" class:w-full={full} class:h-full={full}
		><slot /></span
	>
	<span id="shadow" class="h-3 w-full bg-[#5a535d]"></span>
</div>
