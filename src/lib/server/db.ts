import type { DBStats } from "$lib/Stats";
import { PrismaClient, type Stat, type Suggestion } from "@prisma/client";

export module DB {

    const prisma = new PrismaClient();

    export async function CreateStatRow(game_id: string, stats: DBStats) {
        await prisma.stat.create({
            data: {
                game_id: game_id,
                round_id: stats.round_id,
                location_x: stats.location_x,
                location_z: stats.location_z,
                guess_x: stats.guess_x,
                guess_z: stats.guess_z,
                distance: stats.distance,
                time: stats.time,
                panorama_id: stats.panorama_id,
            }
        });
    }

    export async function GetStats(amount: number): Promise<Stat[][]> {
        // select the latest five unique games
        const games = await prisma.stat.groupBy({
            by: ['game_id'],
            orderBy: {
                game_id: 'desc'
            },
            take: amount
        });

        // select the latest five stats for each game
        const stats = await Promise.all(games.map(async (game) => {
            return await prisma.stat.findMany({
                where: {
                    game_id: game.game_id
                },
                orderBy: {
                    round_id: 'desc'
                },
                take: 5
            });
        }));

        return stats;
    }

    export async function AddSuggestion(text: string) {
        await prisma.suggestion.create({
            data: {
                text: text,
            }
        });
    }

    export async function GetSuggestions(amount: number): Promise<Suggestion[]> {
        return await prisma.suggestion.findMany({
            take: amount,
            orderBy: {
                date: 'desc'
            }
        });
    }
}