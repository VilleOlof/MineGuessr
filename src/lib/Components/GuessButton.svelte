<script lang="ts">
	export let submit_guess: () => Promise<void>;
	export let next_round: () => void;

	export let show_guess: boolean;
	export let show_next: boolean;
</script>

{#if show_guess}
	<button
		on:click={async () => await submit_guess()}
		class="g-drop pointer-events-auto flex border-4 border-gray-900 bg-gray-700 px-6 py-2 text-5xl shadow-gray-900 transition-transform hover:-translate-y-2 active:scale-90"
	>
		Guess
	</button>
{:else if show_next}
	<button
		on:click={() => next_round()}
		class="g-drop pointer-events-auto flex border-4 border-gray-900 bg-gray-700 px-6 py-2 text-5xl shadow-gray-900 transition-transform hover:-translate-y-2 active:scale-90"
	>
		Next
	</button>
{/if}
