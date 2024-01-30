<script lang="ts">
	import { format_time, GetDiscordAvatarUrl, PAGE_SIZE, toast_style, type TopGame } from '$lib';
	import { Game } from '$lib/Game';
	import { onMount } from 'svelte';
	import toast from 'svelte-french-toast';
	import { writable, type Writable } from 'svelte/store';
	import { queryParam, ssp } from 'sveltekit-search-params';
	import type { PageData } from './$types';
	import Label from '$lib/Components/Label.svelte';

	export let data: PageData;

	let lb_data: Writable<TopGame[]> = writable(GetTempLbData(PAGE_SIZE));
	let loading: boolean = false;

	const page = queryParam('page', ssp.number(1));

	function GetTempLbData(amount: number): TopGame[] {
		let data: TopGame[] = [];

		for (let i = 0; i < amount; i++) {
			data.push({
				game_id: i.toString(),
				date: new Date(),
				total_score: 0,
				round_distance: [1, 2, 3, 4, 5],
				total_distance: 0,
				total_time: 5999400,
				user: undefined
			});
		}

		return data;
	}

	async function fetch_page(page: number | null): Promise<TopGame[]> {
		loading = true;
		if (!page) {
			toast.error('Kunde inte ladda in datan, försök igen senare', {
				style: toast_style
			});

			loading = false;
			return [];
		}
		const res = await fetch(`/top/get?page=${page}`);
		loading = false;
		if (res.status === 404) {
			toast.error('Det finns inga fler sidor!', {
				style: toast_style
			});
			return [];
		}

		if (!res.ok) {
			toast.error('Kunde inte ladda in datan, försök igen senare', {
				style: toast_style
			});
			return [];
		}

		let content = await res.json();

		return content;
	}

	async function Discord() {
		try {
			const url = (await (await fetch('/discord/init')).json()).url;
			location.href = url;
		} catch (e) {
			console.error(e);
			toast.error('Något gick fel!', {
				duration: 5000,
				style: toast_style
			});
		}
	}

	async function Page(pageIn: number) {
		const new_page = ($page ?? 1) + pageIn;

		if (new_page < 1 || new_page > data.pages) {
			toast.error('Det finns inga fler sidor!', {
				style: toast_style
			});
			return;
		}

		lb_data.set(await fetch_page(new_page));
		page.set(new_page);
	}

	function short_name(name: string) {
		if (name.length > 13) {
			return name.substring(0, 13) + '...';
		}
		return name;
	}

	onMount(async () => {
		lb_data.set(await fetch_page($page));
	});
</script>

{#if loading}
	<p class="text-center text-5xl">Laddar datan just för dig...</p>
{:else}
	<div class="flex flex-col items-center gap-4">
		<h1 class="text-4xl">Topplista</h1>

		{#if !data.logged_in}
			<p class="text-lg text-gray-300">
				<button
					on:click={Discord}
					class="underline underline-offset-4 transition-colors hover:text-white">Logga in</button
				> för att synas på topplistan!
			</p>
		{/if}

		<div class="relative overflow-x-auto">
			<table
				class="w-full text-left text-sm text-gray-300 sm:text-base md:text-lg lg:text-xl rtl:text-right dark:text-gray-300"
			>
				<thead
					class="bg-gray-50 text-sm uppercase text-gray-800 md:text-base dark:bg-gray-700 dark:text-gray-400"
				>
					<tr>
						<th scope="col" class="px-3 py-1 md:px-6 md:py-3"></th>
						<th scope="col" class="px-3 py-1 md:px-6 md:py-3"> Tid </th>
						<th scope="col" class="px-3 py-1 md:px-6 md:py-3"> Poäng </th>
						<th scope="col" class="hidden px-3 py-1 md:table-cell md:px-6 md:py-3"> Distans </th>
						<th scope="col" class="px-3 py-1 md:px-6 md:py-3"> Användare </th>
					</tr>
				</thead>
				<tbody>
					{#each $lb_data as game, i}
						<tr
							on:click={() => (window.location.href = `/game/${game.game_id}`)}
							class="cursor-pointer border-b bg-white transition-colors hover:bg-gray-600 dark:border-gray-700 dark:bg-gray-800"
						>
							<th
								scope="row"
								class="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white"
							>
								{i + 1 + 10 * (($page ?? 1) - 1)}
							</th>
							<td class="px-3 py-2 md:px-6 md:py-4"> {format_time(game.total_time / 1000)} </td>
							<td class="px-3 py-2 md:px-6 md:py-4">
								{Math.round(game.total_score)}
							</td>
							<td class="hidden px-3 py-2 md:table-cell md:px-6 md:py-4">
								{game.total_distance} blocks
							</td>
							<td class="px-3 py-2 md:px-6 md:py-4">
								<div class="flex items-center gap-2">
									{#if game.user}
										<!--TODO: Make this work with more labels-->
										{#each game.user.labels as label}
											<Label {label} />
										{/each}

										<img
											src={GetDiscordAvatarUrl(game.user.user_id, game.user.avatar)}
											alt=""
											class="h-6 w-6 rounded-full"
										/>

										@{short_name(game.user.username)}
									{:else}
										???
									{/if}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<div class="pages flex text-lg [&>*]:h-8">
			<button
				on:click={async () => await Page(-1)}
				class="flex w-8 items-center justify-center bg-gray-800 transition-colors hover:bg-gray-500 active:bg-gray-700"
				>{'<'}</button
			>
			<p class="flex w-16 items-center justify-center bg-gray-700">{$page}</p>
			<button
				on:click={async () => await Page(1)}
				class="flex w-8 items-center justify-center bg-gray-800 transition-colors hover:bg-gray-500 active:bg-gray-700"
				>{'>'}</button
			>
		</div>
	</div>

	<a
		class="rounds absolute left-0 top-0 m-2 aspect-square h-auto w-16 transition-transform hover:-rotate-6 hover:scale-110 active:scale-90 sm:w-24"
		title="Tillbaka till menyn"
		href="/"
	>
		<img src="/Earth.webp" alt="Tillbaka" />
	</a>
{/if}
