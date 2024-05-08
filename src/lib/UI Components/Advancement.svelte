<script lang="ts">
	export let src: string = '';
	export let alt: string = '';

	export let title: string = '';
	export let description: string = '';

	export let intro: boolean = false;
	export let exit: boolean = false;
	let elem_self: HTMLDivElement;

	$: if (exit && elem_self) {
		elem_self.classList.add('animate-fade-up');
	}
</script>

<div
	bind:this={elem_self}
	class:animate-fade-down={intro}
	class="pixel-corners flex h-24 w-fit min-w-[16rem] items-center justify-center bg-[#555555] p-1 md:min-w-[28rem]"
>
	<div class="pixel-corners-inner flex h-full w-full gap-4 bg-[#212121] px-2">
		{#if src !== ''}
			<span class="flex h-full items-center">
				<img {src} {alt} class="aspect-square h-4/5 w-auto" />
			</span>
		{/if}

		<div class="flex h-full flex-col justify-center text-wrap py-1 pr-2 text-xl md:text-3xl">
			<p class="text-[#f7f900]">{title}</p>
			<p>{description}</p>
		</div>
	</div>
</div>

<style>
	/* https://pixelcorners.lukeb.co.uk/ */
	.pixel-corners {
		clip-path: polygon(
			0px calc(100% - 8px),
			4px calc(100% - 8px),
			4px calc(100% - 4px),
			8px calc(100% - 4px),
			8px 100%,
			calc(100% - 8px) 100%,
			calc(100% - 8px) calc(100% - 4px),
			calc(100% - 4px) calc(100% - 4px),
			calc(100% - 4px) calc(100% - 8px),
			100% calc(100% - 8px),
			100% 8px,
			calc(100% - 4px) 8px,
			calc(100% - 4px) 4px,
			calc(100% - 8px) 4px,
			calc(100% - 8px) 0px,
			8px 0px,
			8px 4px,
			4px 4px,
			4px 8px,
			0px 8px
		);
		position: relative;
	}
	.pixel-corners {
		border: 4px solid transparent;
	}

	.pixel-corners::after {
		content: '';
		position: absolute;
		clip-path: polygon(
			0px calc(100% - 8px),
			4px calc(100% - 8px),
			4px calc(100% - 4px),
			8px calc(100% - 4px),
			8px 100%,
			calc(100% - 8px) 100%,
			calc(100% - 8px) calc(100% - 4px),
			calc(100% - 4px) calc(100% - 4px),
			calc(100% - 4px) calc(100% - 8px),
			100% calc(100% - 8px),
			100% 8px,
			calc(100% - 4px) 8px,
			calc(100% - 4px) 4px,
			calc(100% - 8px) 4px,
			calc(100% - 8px) 0px,
			8px 0px,
			8px 4px,
			4px 4px,
			4px 8px,
			0px 8px,
			0px 50%,
			4px 50%,
			4px 8px,
			8px 8px,
			8px 4px,
			calc(100% - 8px) 4px,
			calc(100% - 8px) 8px,
			calc(100% - 4px) 8px,
			calc(100% - 4px) calc(100% - 8px),
			calc(100% - 8px) calc(100% - 8px),
			calc(100% - 8px) calc(100% - 4px),
			8px calc(100% - 4px),
			8px calc(100% - 8px),
			4px calc(100% - 8px),
			4px 50%,
			0px 50%
		);
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		background: #000000;
		display: block;
		pointer-events: none;
	}
	.pixel-corners::after {
		margin: -4px;
	}

	.pixel-corners-inner {
		clip-path: polygon(
			0px calc(100% - 4px),
			4px calc(100% - 4px),
			4px 100%,
			calc(100% - 4px) 100%,
			calc(100% - 4px) calc(100% - 4px),
			100% calc(100% - 4px),
			100% 4px,
			calc(100% - 4px) 4px,
			calc(100% - 4px) 0px,
			4px 0px,
			4px 4px,
			0px 4px
		);
	}
</style>
