import { dateRangeParams, toYmd } from './date-range';

describe('dateRangeParams', () => {
    it('a finished range sends both days', () => {
        expect(dateRangeParams([new Date(2025, 2, 10), new Date(2025, 2, 12)])).toEqual({
            from: '2025-03-10',
            to: '2025-03-12',
        });
    });

    it('an unfinished range (second date still null) means that one day, not "null"', () => {
        expect(dateRangeParams([new Date(2025, 2, 10), null])).toEqual({
            from: '2025-03-10',
            to: '2025-03-10',
        });
        expect(dateRangeParams([new Date(2025, 2, 10)])).toEqual({
            from: '2025-03-10',
            to: '2025-03-10',
        });
    });

    it('a cleared or empty picker sends nothing, and never throws', () => {
        for (const empty of ['', null, undefined, [], [null, null], [undefined, new Date()]]) {
            expect(() => dateRangeParams(empty)).not.toThrow();
            expect(dateRangeParams(empty)).toEqual({});
        }
    });

    it('ignores things that are not real dates', () => {
        expect(dateRangeParams([new Date('nonsense'), new Date()])).toEqual({});
        expect(dateRangeParams(['2025-03-10', '2025-03-12'])).toEqual({});
        expect(dateRangeParams(42)).toEqual({});
        expect(dateRangeParams({ 0: new Date() })).toEqual({});
    });

    it('a broken second date falls back to the first day', () => {
        expect(dateRangeParams([new Date(2025, 2, 10), new Date('x')])).toEqual({
            from: '2025-03-10',
            to: '2025-03-10',
        });
    });
});

describe('toYmd', () => {
    it('keeps the calendar day the user clicked, whatever the time of day', () => {
        expect(toYmd(new Date(2025, 0, 1, 0, 0, 0))).toBe('2025-01-01');
        expect(toYmd(new Date(2025, 0, 1, 23, 59, 59))).toBe('2025-01-01');
        expect(toYmd(new Date(2025, 11, 31, 12, 0))).toBe('2025-12-31');
    });

    it('pads single digits and handles a leap day', () => {
        expect(toYmd(new Date(2025, 2, 5))).toBe('2025-03-05');
        expect(toYmd(new Date(2024, 1, 29))).toBe('2024-02-29');
    });
});
