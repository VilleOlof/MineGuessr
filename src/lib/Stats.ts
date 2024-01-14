import { persisted } from "svelte-persisted-store";
import type { Writable } from "svelte/store";

export type Stats = {
    games_played: number;
    games_finished: number;

    total_score: number;

    average_score: number;

    average_distance: number;
    total_distance: number;

    best_score: number;
    worst_score: number;
};

export const Stats: Writable<Stats> = persisted("90gqguessr-stats", {
    games_played: 0,
    games_finished: 0,

    total_score: 0,

    average_score: 0,

    average_distance: 0,
    total_distance: 0,

    best_score: 0,
    worst_score: 0
});