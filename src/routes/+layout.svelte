<script>
	import '../app.pcss';
</script>

<svelte:head>
	<title>90gQ Guessr</title>

	<meta property="og:title" content="90gQ Guessr" />
	<meta property="og:description" content="Liknande GeoGuessr, fast för minecraft servern 90gQ" />
	<!-- <meta property="og:image" content="{PUBLIC_URL}/favicon.png" />
	<meta property="og:url" content={PUBLIC_URL} /> -->
	<meta content="#22c55e" name="theme-color" />
</svelte:head>

<main
	class="siteWrapper font-body no-scrollbar flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-gray-900 text-gray-100"
>
	<slot />
</main>

{@html "<!-- What will today's adventure be? -->"}

<style>
	:global(.c-shadow) {
		--offset: 4px;

		box-shadow: var(--offset) var(--offset) 0px -1px var(--tw-shadow-color);
		-webkit-box-shadow: var(--offset) var(--offset) 0px -1px var(--tw-shadow-color);
		-moz-box-shadow: var(--offset) var(--offset) 0px -1px var(--tw-shadow-color);
	}

	:global(.current_pos, .correct_pos) {
		background-color: rgb(17 24 39);
		padding: 0.5rem;
		font-size: 1.5rem;
		border-radius: 0.5rem;
	}

	:global(.current_pos > img) {
		filter: invert(70%) sepia(30%) saturate(2641%) hue-rotate(148deg) brightness(104%) contrast(87%);
		width: 100%;
		height: 100%;
	}
	:global(.correct_pos > img) {
		filter: invert(74%) sepia(88%) saturate(1208%) hue-rotate(72deg) brightness(101%) contrast(94%);
		width: 100%;
		height: 100%;
	}
</style>
