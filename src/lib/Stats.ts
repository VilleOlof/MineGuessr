import { persisted } from "svelte-persisted-store";
import type { Writable } from "svelte/store";
import { z } from "zod";

export const StatsSchema = z.object({
    games_played: z.number(),
    games_finished: z.number(),

    total_score: z.number(),

    average_score: z.number(),

    average_distance: z.number(),
    total_distance: z.number(),

    best_score: z.number(),
    worst_score: z.number(),

    total_time: z.number()
});

export type Stats = z.infer<typeof StatsSchema>;

export const Stats: Writable<Stats> = persisted("90gqguessr-stats", {
    games_played: 0,
    games_finished: 0,

    total_score: 0,

    average_score: 0,

    average_distance: 0,
    total_distance: 0,

    best_score: 0,
    worst_score: 0,

    total_time: 0,
});

export const DBStatsSchema = z.object({
    round_id: z.number(),

    location_x: z.number(),
    location_z: z.number(),
    guess_x: z.number(),
    guess_z: z.number(),
    distance: z.number(),
    time: z.number(),
    panorama_id: z.number(),
});
export type DBStats = z.infer<typeof DBStatsSchema>;