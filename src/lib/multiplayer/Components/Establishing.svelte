<script lang="ts">
	import Header from '$lib/Components/Header.svelte';
</script>

<Header />

<h1 class="my-4 text-4xl">Trying to talk with the server...</h1>

<div class="lds-ring">
	<div></div>
	<div></div>
	<div></div>
	<div></div>
</div>

<style>
	/* https://loading.io/css/ */

	.lds-ring {
		display: inline-block;
		position: relative;
		width: 80px;
		height: 80px;
	}
	.lds-ring div {
		--color: #91ee5c;
		--size: 128px;
		--width: 16px;

		box-sizing: border-box;
		display: block;
		position: absolute;
		width: var(--size);
		height: var(--size);
		margin: var(--width);
		border: var(--width) solid var(--color);
		border-radius: 50%;
		animation: lds-ring 1.5s cubic-bezier(0.5, 0, 0.5, 1) infinite;
		border-color: var(--color) transparent transparent transparent;
	}
	.lds-ring div:nth-child(1) {
		animation-delay: -0.45s;
	}
	.lds-ring div:nth-child(2) {
		animation-delay: -0.3s;
	}
	.lds-ring div:nth-child(3) {
		animation-delay: -0.15s;
	}
	@keyframes lds-ring {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
