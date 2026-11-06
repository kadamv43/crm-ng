// Turns the server's reply to an upload / paste-assign into a toast message.
// The server counts what happened: new contacts, numbers already known,
// repeats inside the file, invalid numbers, numbers already waiting.

export interface UploadSummary {
    added?: number;
    assigned?: number;
    invalid?: number;
    invalid_mobiles?: string[];
    message?: string;
}

export function uploadToast(res: UploadSummary | null | undefined) {
    const done = res?.added ?? res?.assigned;

    // an older / unexpected reply: nothing to count, so just confirm
    if (done === undefined) {
        return {
            severity: 'success',
            summary: 'Success Message',
            detail: 'Done',
        };
    }

    let detail = res?.message || `${done} done`;
    if (res?.invalid && res?.invalid_mobiles?.length) {
        detail += `. Invalid: ${res.invalid_mobiles.join(', ')}`;
    }

    return done > 0
        ? { severity: 'success', summary: 'Success Message', detail }
        : { severity: 'warn', summary: 'Nothing was added', detail };
}
