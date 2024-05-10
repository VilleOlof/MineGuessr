<script lang="ts">
	import Button from '$lib/UI Components/Button/Button.svelte';

	export let submit_guess: () => Promise<void>;
	export let next_round: () => void;

	export let show_guess: boolean;
	export let show_next: boolean;
	export let mp_wait: boolean = false;
</script>

{#if show_guess}
	<Button on:click={async () => await submit_guess()}>
		<span class="flex w-full items-center justify-center font-MinecraftTen text-3xl">Guess</span>
	</Button>
{:else if show_next}
	<Button on:click={() => next_round()}>
		<span class="flex w-full items-center justify-center font-MinecraftTen text-3xl">Next</span>
	</Button>
{:else if mp_wait}
	<span class="opacity-60">
		<Button>
			<span class="flex w-full items-center justify-center font-MinecraftTen text-3xl"
				>Waiting for others</span
			>
		</Button>
	</span>
{:else}
	<span class="opacity-60">
		<Button>
			<span class="flex w-full items-center justify-center font-MinecraftTen text-3xl"
				>Place a pin to guess</span
			>
		</Button>
	</span>
{/if}
