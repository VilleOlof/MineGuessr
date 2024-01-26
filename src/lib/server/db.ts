import { PAGE_SIZE, type TopGame } from "$lib";
import type { DBStats, Stats } from "$lib/Stats";
import { PrismaClient, type Stat, type Suggestion, type User } from "@prisma/client";

/**
 * The database module
 */
export module DB {

    export const prisma = new PrismaClient();

    /**
     * Creates a new game row in the database
     * 
     * @param game_id The game id
     * @param stats The stats to add
     */
    export async function CreateStatRow(game_id: string, stats: DBStats, user_id?: string) {
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
                user: {
                    connect: {
                        user_id: user_id
                    }
                }
            }
        });
    }

    export type StatWithUser = Stat & {
        user: User | null
    };

    /**
     * Gets the stats for a game
     * 
     * @param game_id The game id
     * @returns {Stat[]} The stats
     */
    export async function GetStat(game_id: string): Promise<StatWithUser[]> {
        return await prisma.stat.findMany({
            where: {
                game_id: game_id
            },
            orderBy: {
                round_id: 'desc'
            },
            include: {
                user: true
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

    /**
     * Gets the total amount of logged in users
     * 
     * @returns {number} The total amount of logged in users
     */
    export async function GetUserCount(): Promise<number> {
        return await prisma.user.count();
    }

    /**
     * Gets the top games
     * Used for the leaderboard
     * 
     * @param limit How many games to get
     * @param offset The offset
     * @returns 
     */
    export async function GetTopGames(limit: number, offset: number): Promise<TopGame[]> {
        type MidTopGame = {
            game_id: string,
            date: Date,
            user_id: string;
            total_score: number,
            total_distance: number,
            total_time: number
            round_distances: string
        };

        // TODO UNDERSTAND THIS QUERY, AND TEST WITH MORE USERS

        // const games: MidTopGame[] = await prisma.$queryRaw`
        //     SELECT 
        //         game_id, 
        //         date, 
        //         user_id, 
        //         GROUP_CONCAT(distance) as round_distances, 
        //         SUM(
        //             CASE 
        //                 WHEN (5000 - (distance - 16) * 0.25) < 0 THEN 0
        //                 WHEN (5000 - (distance - 16) * 0.25) > 5000 THEN 5000
        //                 ELSE (5000 - (distance - 16) * 0.25)
        //             END
        //         ) as total_score, 
        //         SUM(distance) as total_distance, 
        //         SUM(time) as total_time
        //     FROM stat
        //     GROUP BY game_id
        //     HAVING COUNT(*) = 5
        //     ORDER BY total_score DESC, total_time ASC
        //     LIMIT ${limit} OFFSET ${offset}
        // `;
        const games: MidTopGame[] = await prisma.$queryRaw`
            SELECT 
                game_id, 
                date, 
                user_id, 
                round_distances, 
                total_score, 
                total_distance, 
                total_time
            FROM (
                SELECT 
                    game_id, 
                    date, 
                    user_id, 
                    round_distances, 
                    total_score, 
                    total_distance, 
                    total_time,
                    ROW_NUMBER() OVER(PARTITION BY COALESCE(user_id, game_id) ORDER BY total_score DESC, total_time ASC) as rn
                FROM (
                    SELECT 
                        game_id, 
                        date, 
                        user_id, 
                        GROUP_CONCAT(distance) as round_distances, 
                        SUM(
                            CASE 
                                WHEN (5000 - (distance - 16) * 0.25) < 0 THEN 0
                                WHEN (5000 - (distance - 16) * 0.25) > 5000 THEN 5000
                                ELSE (5000 - (distance - 16) * 0.25)
                            END
                        ) as total_score, 
                        SUM(distance) as total_distance, 
                        SUM(time) as total_time
                    FROM stat
                    GROUP BY game_id, user_id
                    HAVING COUNT(*) = 5
                ) t
            ) t2
            WHERE rn = 1
            ORDER BY total_score DESC, total_time ASC
            LIMIT ${limit} OFFSET ${offset}
        `;

        const gameUserIds = games.map(game => game.user_id).filter((value) => value !== null);

        const users = await prisma.user.findMany({
            where: {
                id: {
                    in: gameUserIds
                }
            },
            select: {
                id: true,
                user_id: true,
                username: true,
                avatar: true
            }
        });

        const result: TopGame[] = games.map(game => ({
            ...game,
            total_score: Number(game.total_score),
            total_distance: Number(game.total_distance),
            total_time: Number(game.total_time), // From BigInt to Number
            round_distance: game.round_distances.split(',').map(Number),
            user: users.find(user => user.id === game.user_id)
        }));

        return result;
    }

    export async function GetAmountOfGamePages(): Promise<number> {
        const amountOfGames: { amount: BigInt }[] = await prisma.$queryRaw`
            SELECT COUNT(*) as amount
            FROM (
                SELECT game_id
                FROM stat
                GROUP BY game_id
                HAVING COUNT(*) = 5
            ) as games
        `;

        return Math.ceil(Number(amountOfGames[0].amount) / PAGE_SIZE);
    }

    export async function UpsertStatistics(user_id: string, stats: Stats) {
        return await prisma.statistics.upsert({
            where: {
                user_id: user_id
            },
            update: {
                games_played: stats.games_played,
                games_finished: stats.games_finished,
                total_score: stats.total_score,
                average_score: stats.average_score,
                average_distance: stats.average_distance,
                total_distance: stats.total_distance,
                best_score: stats.best_score,
                worst_score: stats.worst_score,
                total_time: stats.total_time
            },
            create: {
                user_id: user_id,
                games_played: stats.games_played,
                games_finished: stats.games_finished,
                total_score: stats.total_score,
                average_score: stats.average_score,
                average_distance: stats.average_distance,
                total_distance: stats.total_distance,
                best_score: stats.best_score,
                worst_score: stats.worst_score,
                total_time: stats.total_time
            }
        });
    }

    export async function GetStatistics(user_id: string) {
        return await prisma.statistics.findUnique({
            where: {
                user_id: user_id
            }
        });
    }
}