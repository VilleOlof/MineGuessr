import type { DBStats } from "$lib/Stats";
import { PrismaClient } from "@prisma/client";

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

    export async function AddSuggestion(text: string) {
        await prisma.suggestion.create({
            data: {
                text: text,
            }
        });
    }
}