import { PUBLIC_ORIGIN } from "$env/static/public";
import { GameType } from "$lib";
import { toast } from "./AdvancementToast";

export async function share(points: number, data: { game_id: string, game_type: GameType }) {
    if (navigator?.canShare?.()) {
        const date = new Date();
        await navigator.share({
            title: 'MineGuessr',
            text: `I got ${points} points on daily MineGuessr!${data.game_type === GameType.Daily
                ? `(${date.getFullYear()}/${date.getMonth()}/${date.getDate()})`
                : ''
                }`,
            url: `${PUBLIC_ORIGIN}/game/${data.game_id}`
        });
    } else {
        await navigator.clipboard.writeText(`${PUBLIC_ORIGIN}/game/${data.game_id}`);

        toast({
            title: 'Success',
            description: 'Link copied to your clipboard!'
        });
    }
}