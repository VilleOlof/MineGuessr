<span class="group flex w-fit flex-col">
	<span id="shadow-balancer" class="h-0 w-full transition-all group-active:h-3"></span>
	<button
		on:click
		class="flex w-fit flex-col border-[6px] border-[#28272a] text-7xl text-[#1d1e22] transition-transform group-active:translate-y-3"
	>
		<span
			class="z-10 border-4 border-white bg-[#d0d1d5] px-8 py-2 transition-colors group-hover:bg-[#b1b2b5]"
			><slot /></span
		>
		<span id="shadow" class="h-3 w-full bg-[#5a535d] transition-all group-active:h-0"></span>
	</button>
</span>
