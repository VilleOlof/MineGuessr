import { expect, test, describe, vi } from 'vitest';
import { UserLabel } from '$lib/userLabel';

describe('UserLabel', () => {
    vi.spyOn(UserLabel, 'Labels', 'get').mockReturnValue({
        'LabelOne': '#123456',
        'CoolLabel': '#abcdef'
    });

    test('returns valid labels', () => {
        const labels = ['LabelOne', 'CoolLabel', 'InvalidLabel'];
        const validLabels = UserLabel.get_valid_labels(labels);
        expect(validLabels).toEqual(['LabelOne', 'CoolLabel']);
    });

    test('returns valid label color', () => {
        const label = 'LabelOne';
        const color = UserLabel.get_label_color(label);
        expect(color).toEqual('#123456');
    });

    test('returns invalid label color', () => {
        const label = 'InvalidLabel';
        const color = UserLabel.get_label_color(label);
        expect(color).toEqual('#ffffff');
    });

    test('returns true for valid label', () => {
        const label = 'CoolLabel';
        const isValid = UserLabel.is_valid(label);
        expect(isValid).toBe(true);
    });

    test('returns false for invalid label', () => {
        const label = 'InvalidLabel';
        const isValid = UserLabel.is_valid(label);
        expect(isValid).toBe(false);
    });
});
