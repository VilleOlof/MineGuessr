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
	class="siteWrapper font-body no-scrollbar flex h-screen w-screen flex-col items-center justify-start overflow-hidden bg-slate-900 text-gray-100"
>
	<slot />
</main>
