import { expect, describe, test, beforeEach } from 'vitest';
import { Game } from '$lib/Game';
import { GameType, type location_metadata } from '$lib';

describe('Game', () => {
    const location_metadata: location_metadata[] = [
        {
            id: 1,
            coordinates: [1, 2]
        },
        {
            id: 2,
            coordinates: [3, 4]
        },
        {
            id: 3,
            coordinates: [5, 6]
        },
        {
            id: 4,
            coordinates: [7, 8]
        },
        {
            id: 5,
            coordinates: [9, 10]
        }
    ];

    let game: Game;

    beforeEach(() => {
        game = Game.create(location_metadata, GameType.Normal);
    });

    test('get_current_round should return the current round', () => {
        const currentRound = game.get_current_round();
        expect(currentRound).toBeInstanceOf(Object);
    });

    test('calculate_score should return the correct score', () => {
        const distance = 100;
        const score = Game.calculate_score(distance);
        expect(score).toBeGreaterThan(0);
    });

    test('check_daily should return true', () => {
        const [server, user] = [new Date(), new Date()];
        server.setHours(0, 0, 0, 0);
        user.setHours(23, 59, 59, 999);

        const daily = Game.check_daily(server, user);
        expect(daily).toBe(true);
    })

    test('check_daily should return false', () => {
        const [server, user] = [new Date(), new Date()];
        user.setDate(user.getDate() - 1);

        const daily = Game.check_daily(server, user);
        expect(daily).toBe(false);
    });
});
