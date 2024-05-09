import { PUBLIC_ORIGIN } from "$env/static/public";
import { GameType } from "$lib";
import { toast } from "./AdvancementToast";
import type { Game } from "./Game";

export async function share(points: number, game: Game) {
    if (navigator?.canShare?.()) {
        const date = new Date();
        await navigator.share({
            title: 'MineGuessr',
            text: `I got ${points} points on daily MineGuessr!${game.game_type === GameType.Daily
                ? `(${date.getFullYear()}/${date.getMonth()}/${date.getDate()})`
                : ''
                }`,
            url: `${PUBLIC_ORIGIN}/game/${game.game_id}`
        });
    } else {
        await navigator.clipboard.writeText(`${PUBLIC_ORIGIN}/game/${game.game_id}`);

        toast({
            title: 'Success',
            description: 'Link copied to your clipboard!'
        });
    }
}