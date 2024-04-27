<script lang="ts">
	import { GetDiscordAvatarUrl } from '$lib';
	import type { PageData } from './$types';

	export let data: PageData;
	const { profile_user } = data;
	const avatar = GetDiscordAvatarUrl(profile_user.user_id, profile_user.avatar);
</script>

<div class="profile flex h-full w-full flex-col items-start justify-start gap-2 p-4">
	<header class="relative flex w-full items-center gap-4">
		<img src={avatar} alt="" class="h-24 w-24 rounded-full" />
		<h1 class="text-6xl">{profile_user.username}</h1>
	</header>

	<p class="text-gray-300">Watcha doing here? This isn't done...</p>
</div>
