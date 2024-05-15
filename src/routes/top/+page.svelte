<script lang="ts">
	import { Discord, format_time, GetDiscordAvatarUrl, PAGE_SIZE, type TopGame } from '$lib';
	import { onMount } from 'svelte';
	import { writable, type Writable } from 'svelte/store';
	import { queryParam, ssp } from 'sveltekit-search-params';
	import type { PageData } from './$types';
	import Label from '$lib/Components/Label.svelte';
	import { toast } from '$lib/AdvancementToast';
	import MenuButton from '$lib/Components/MenuButton.svelte';
	import EmptyContainer from '$lib/UI Components/Container/EmptyContainer.svelte';

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
			toast({
				title: 'No page found!',
				description: 'No page found, try again later!',
				duration: 2000
			});

			loading = false;
			return [];
		}
		const res = await fetch(`/top/get?page=${page}`);
		loading = false;
		if (res.status === 404) {
			toast({
				title: 'No more pages found!',
				description: 'No more pages found, try again later!',
				duration: 2000
			});
			return [];
		}

		if (!res.ok) {
			toast({
				title: 'Error!',
				description: 'An error occurred while fetching the data!',
				duration: 2000
			});
			return [];
		}

		let content = await res.json();

		return content;
	}

	async function Page(pageIn: number) {
		const new_page = ($page ?? 1) + pageIn;

		if (new_page < 1 || new_page > data.pages) {
			toast({
				title: 'Invalid page!',
				description: 'Invalid page, try again later!',
				duration: 2000
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
	<p class="text-center text-5xl">Loading the data just for you...</p>
{:else}
	<div class="flex flex-col items-center gap-4">
		<h1 class="font-MinecraftTen text-7xl">Leaderboard</h1>

		{#if !data.logged_in}
			<p class="text-lg text-gray-300">
				<button class="underline underline-offset-2 transition-colors hover:text-white"
					>Log in</button
				> to get a spot on the leaderboard!
			</p>
		{/if}

		<EmptyContainer>
			<div class="relative overflow-x-auto">
				<table
					class="w-full text-left text-sm text-gray-300 sm:text-base md:text-lg lg:text-xl rtl:text-right"
				>
					<thead class=" bg-mc-text-black text-sm uppercase text-gray-300 md:text-base">
						<tr>
							<th scope="col" class="px-3 py-1 md:px-6 md:py-3"></th>
							<th scope="col" class="px-3 py-1 md:px-6 md:py-3"> Time </th>
							<th scope="col" class="px-3 py-1 md:px-6 md:py-3"> Points </th>
							<th scope="col" class="hidden px-3 py-1 md:table-cell md:px-6 md:py-3"> Distance </th>
							<th scope="col" class="px-3 py-1 md:px-6 md:py-3"> User </th>
						</tr>
					</thead>
					<tbody>
						{#each $lb_data as game, i}
							<tr
								on:click={() => (window.location.href = `/game/${game.game_id}`)}
								class="cursor-pointer border-b border-gray-700 text-mc-text-black transition-colors hover:bg-[#a2a3a5]"
							>
								<th scope="row" class="whitespace-nowrap px-6 py-4 font-medium">
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
											<!--TODO: Make this work with more labels -->
											{#each game.user.labels as label}
												<Label {label} color={data.labels[label]} />
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
		</EmptyContainer>

		<EmptyContainer>
			<div class="pages flex text-lg [&>*]:h-8">
				<button
					on:click={async () => await Page(-1)}
					class="flex w-8 items-center justify-center bg-[#8c8d8f] transition-colors hover:bg-[#7a7a7c] active:bg-[#737475]"
					>{'<'}</button
				>
				<p class="flex w-16 items-center justify-center">{$page}</p>
				<button
					on:click={async () => await Page(1)}
					class="flex w-8 items-center justify-center bg-[#8c8d8f] transition-colors hover:bg-[#7a7a7c] active:bg-[#737475]"
					>{'>'}</button
				>
			</div>
		</EmptyContainer>
	</div>
{/if}

<MenuButton />
