import { MPClient } from "$lib/multiplayer/Client";

export async function load() {
    const lobbies = await MPClient.get_lobbies();

    return {
        lobbies: lobbies
    }
}