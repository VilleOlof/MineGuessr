import { location_metadata } from ".";

export type Config = {
    panoramas: location_metadata[];
    visibility: Visibility;
};

export type Visibility = "public" | "private";

export const request_type = {
    CREATE_GAME: 0,
    JOIN_GAME: 1,
    LEAVE_GAME: 2,
    PLAYER_READY: 3,
    GUESS_LOCATION: 4,
    NEXT_ROUND: 5,
    ERROR: 6
} as const;
export type request_type = typeof request_type[keyof typeof request_type];