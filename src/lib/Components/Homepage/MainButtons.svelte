<script lang="ts">
	import { goto } from '$app/navigation';
	import { env } from '$env/dynamic/public';
	import { toast } from '$lib/AdvancementToast';
	import Button from '$lib/UI Components/Button/Button.svelte';

	export let size: 10 | 16;
	const sizes = {
		10: '2.5rem',
		16: '4rem'
	};
	let _size = sizes[size];

	export let mp_enabled = false;
</script>

<Button on:click={() => goto('/play')}
	><img src="/Earth.webp" alt="" style="height: {_size}; width: {_size}" /> Singleplayer</Button
>
<Button on:click={() => goto('/play?daily=true')}
	><img src="/Earth.webp" alt="" style="height: {_size}; width: {_size}" /> Daily mode</Button
>

{#if env.PUBLIC_DISCORD_ENABLED === 'true'}
	<Button
		on:click={() => {
			if (!mp_enabled) {
				toast({
					title: 'Multiplayer disabled',
					description: 'You need to be logged in to play multiplayer'
				});

				return;
			}
			goto('/mp');
		}}
		classes={mp_enabled ? '' : 'mp-disabled'}
		><img src="/Earth.webp" alt="" style="height: {_size}; width: {_size}" /> Multiplayer</Button
	>
	<Button on:click={() => goto('/top')}
		><img src="/Earth.webp" alt="" style="height: {_size}; width: {_size}" /> Leaderboards</Button
	>
{/if}

<style>
	:global(.mp-disabled) {
		opacity: 0.5;
	}
</style>
