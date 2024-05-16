import { PUBLIC_ORIGIN } from "$env/static/public";
import { GameType } from "$lib";
import { toast } from "./AdvancementToast";

export async function share(data: { game_id: string, game_type: GameType }) {
    await navigator.clipboard.writeText(`${PUBLIC_ORIGIN}/game/${data.game_id}`);

    toast({
        title: 'Success',
        description: 'Link copied to your clipboard!'
    });
}