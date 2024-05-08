<script>
	import Advancement from '$lib/UI Components/Advancement.svelte';
	import toast_ from 'svelte-french-toast';

	export let toast;
	export let title;
	export let description;
	export let src;

	// Use this component in your app:
	// toast(RichContent, { props: { someProp: '⭐' }})
</script>

<!-- <span>
	Custom and <b>bold</b> with props like !
	<button on:click={() => toast_.dismiss(toast.id)}>Dismiss</button>
</span> -->

<Advancement {title} {description} {src} />
