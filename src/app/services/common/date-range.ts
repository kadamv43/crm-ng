// What the date pickers on the lead lists send to the server.
//
// A range picker's value is [first, second]: the second is null until the
// user picks it, and the whole value is null once cleared. The server reads
// plain dates ("2025-03-10") as whole India days, so one pick means that day.

const pad = (n: number) => String(n).padStart(2, '0');

/** A calendar day as "yyyy-MM-dd" from the date the user picked (no time-zone shift). */
export function toYmd(date: Date): string {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
        date.getDate()
    )}`;
}

const isDate = (value: unknown): value is Date =>
    value instanceof Date && !isNaN(value.getTime());

/** { from, to } for a request, or {} when no usable date was picked. */
export function dateRangeParams(selected: unknown): {
    from?: string;
    to?: string;
} {
    const [first, second] = Array.isArray(selected) ? selected : [];
    if (!isDate(first)) {
        return {};
    }
    return {
        from: toYmd(first),
        to: toYmd(isDate(second) ? second : first),
    };
}
