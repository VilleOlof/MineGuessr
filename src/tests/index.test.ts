import { expect, test, describe } from 'vitest';
import { format_time } from '$lib';

describe('lib index', () => {

    test('format_time', () => {
        expect(format_time(0)).toBe('00:00');
        expect(format_time(1)).toBe('00:01');
        expect(format_time(30.5)).toBe('00:30');
        expect(format_time(60)).toBe('01:00');
        expect(format_time(3600)).toBe('60:00');
        expect(format_time(3661)).toBe('61:01');
    });
});