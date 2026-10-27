import { uploadToast } from './upload-summary';

describe('uploadToast', () => {
    it('shows the server message as a success when something was added', () => {
        const t = uploadToast({
            added: 940,
            message: '940 added, 700 new contacts, 260 already known',
        });
        expect(t.severity).toBe('success');
        expect(t.detail).toBe('940 added, 700 new contacts, 260 already known');
    });

    it('treats a paste-assign reply (assigned) the same way', () => {
        const t = uploadToast({ assigned: 3, message: '3 assigned, 1 new contacts' });
        expect(t.severity).toBe('success');
        expect(t.detail).toContain('3 assigned');
    });

    it('warns instead of claiming success when nothing was added', () => {
        const t = uploadToast({
            added: 0,
            message:
                '0 added, 0 new contacts, 5 already known, 5 already waiting in the pool (skipped)',
        });
        expect(t.severity).toBe('warn');
        expect(t.summary).toBe('Nothing was added');
        expect(t.detail).toContain('already waiting in the pool');
    });

    it('lists the invalid numbers it was told about', () => {
        const t = uploadToast({
            added: 1,
            invalid: 2,
            invalid_mobiles: ['abc', '123'],
            message: '1 added',
        });
        expect(t.detail).toBe('1 added. Invalid: abc, 123');
    });

    it('does not mention invalid numbers when there are none', () => {
        const t = uploadToast({
            added: 1,
            invalid: 0,
            invalid_mobiles: [],
            message: '1 added',
        });
        expect(t.detail).toBe('1 added');
    });

    it('falls back to a plain confirmation for an unexpected reply', () => {
        expect(uploadToast(null).severity).toBe('success');
        expect(uploadToast(undefined).severity).toBe('success');
        expect(uploadToast({}).severity).toBe('success');
    });

    it('still reports a count when the server sent no message', () => {
        expect(uploadToast({ added: 4 }).detail).toBe('4 done');
    });
});
