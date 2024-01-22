import type { DBStats } from "$lib/Stats";
import { PrismaClient, type Stat, type Suggestion } from "@prisma/client";

/**
 * The database module
 */
export module DB {

    const prisma = new PrismaClient();

    /**
     * Creates a new game row in the database
     * 
     * @param game_id The game id
     * @param stats The stats to add
     */
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

    /**
     * Gets the stats for a game
     * 
     * @param game_id The game id
     * @returns {Stat[]} The stats
     */
    export async function GetStat(game_id: string): Promise<Stat[]> {
        return await prisma.stat.findMany({
            where: {
                game_id: game_id
            },
            orderBy: {
                round_id: 'desc'
            }
        });
    }

    /**
     * Gets the total amount of stats
     * 
     * @returns {number} The total amount of stats
     */
    export async function GetTotalStats(): Promise<number> {
        return await prisma.stat.count();
    }

    /**
     * Gets the total amount of stats within a time
     * 
     * @param time The time in milliseconds
     * @returns {number} The total amount of stats within a time
     */
    export async function GetTotalStatsWithinTime(time: number): Promise<number> {
        return await prisma.stat.count({
            where: {
                date: {
                    gt: new Date(Date.now() - time)
                }
            }
        });
    }

    /**
     * Gets the total amount of games
     * 
     * @param amount The amount of games to get
     * @returns {Stat[][]} The stats
     */
    export async function GetStats(amount: number): Promise<Stat[][]> {
        // select the latest five unique games
        const games = await prisma.stat.findMany({
            distinct: ['game_id'],
            orderBy: {
                date: 'desc',
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

    /**
     * Adds a suggestion to the database
     * 
     * @param text The suggestion text
     */
    export async function AddSuggestion(text: string) {
        await prisma.suggestion.create({
            data: {
                text: text,
            }
        });
    }

    /**
     * Gets the latest x suggestions
     * 
     * @param amount The amount of suggestions to get
     * @returns {Suggestion[]} The suggestions
     */
    export async function GetSuggestions(amount: number): Promise<Suggestion[]> {
        return await prisma.suggestion.findMany({
            take: amount,
            orderBy: {
                date: 'desc'
            }
        });
    }
}