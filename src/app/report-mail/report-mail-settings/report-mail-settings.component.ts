import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { BranchesService } from 'src/app/services/branches/branches.service';
import {
    ReportMailService,
    ReportMailSettings,
} from 'src/app/services/report-mail/report-mail.service';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const MAX_RECIPIENTS = 10;

// The hourly smart-view email: who gets it, when, and whether it is working.
@Component({
    selector: 'app-report-mail-settings',
    templateUrl: './report-mail-settings.component.html',
    styleUrl: './report-mail-settings.component.scss',
    providers: [MessageService],
})
export class ReportMailSettingsComponent implements OnInit {
    role = '';
    companies: { name: string; code: string }[] = [];
    selectedCompany = '';

    ready = false;
    saving = false;
    testing = false;

    model: ReportMailSettings = this.emptyModel();
    private original = '';

    saved = false;
    lastSentAt: string | null = null;
    lastStatus: string | null = null;
    lastError: string | null = null;
    logs: any[] = [];

    readonly maxRecipients = MAX_RECIPIENTS;
    readonly hours = Array.from({ length: 24 }, (_, h) => ({
        value: h,
        label: this.hourLabel(h),
    }));

    constructor(
        private reportMail: ReportMailService,
        private branchService: BranchesService,
        private authService: AuthService,
        private toast: MessageService
    ) {}

    ngOnInit() {
        this.role = this.authService.getRole();
        if (this.role == 'superadmin') {
            this.getCompanies();
        } else {
            this.load();
        }
    }

    getCompanies() {
        this.branchService.getAll({ page: 0, size: 100 }).subscribe({
            next: (res: any) => {
                this.companies = res.data.map((item) => ({
                    name: item?.name,
                    code: item?._id,
                }));
                if (this.companies.length > 0) {
                    this.selectedCompany = this.companies[0].code;
                    this.load();
                }
            },
        });
    }

    onCompanyChange() {
        this.load();
    }

    /** the company asked about: only superadmin chooses, the server fixes everyone else */
    private branch(): string | undefined {
        return this.role == 'superadmin' ? this.selectedCompany : undefined;
    }

    load() {
        if (this.role == 'superadmin' && !this.selectedCompany) {
            return;
        }
        this.ready = false;
        forkJoin([
            this.reportMail.getSettings(this.branch()),
            this.reportMail.getLogs(this.branch()),
        ]).subscribe({
            next: ([settings, logs]: any[]) => {
                this.apply(settings);
                this.logs = logs ?? [];
                this.ready = true;
            },
            error: (err) => this.fail(err, 'Could not load the settings'),
        });
    }

    // ------------------------------------------------------------- editing

    get dirty(): boolean {
        return JSON.stringify(this.editable()) !== this.original;
    }

    get canTest(): boolean {
        return (
            this.saved &&
            !this.dirty &&
            this.model.recipients.length > 0 &&
            !this.testing &&
            !this.saving
        );
    }

    /** Chips hands over whatever was typed: keep valid, new addresses only. */
    onAddRecipient(event: { value: string }) {
        const typed = String(event?.value ?? '');
        const address = typed.trim().toLowerCase();
        const others = this.model.recipients.filter((r) => r !== typed);

        if (!EMAIL.test(address) || address.length > 254) {
            this.model.recipients = others;
            this.toast.add({
                severity: 'warn',
                summary: 'Not an email address',
                detail: `"${typed.slice(0, 60)}" is not a valid email address.`,
            });
            return;
        }
        this.model.recipients = others.includes(address)
            ? others
            : [...others, address];
    }

    save() {
        const problem = this.problem();
        if (problem) {
            this.toast.add({ severity: 'warn', summary: 'Please check', detail: problem });
            return;
        }
        this.saving = true;
        this.reportMail.saveSettings(this.editable(), this.branch()).subscribe({
            next: (res: any) => {
                this.apply(res);
                this.saving = false;
                this.toast.add({
                    severity: 'success',
                    summary: 'Saved',
                    detail: res.enabled
                        ? 'The hourly email is on.'
                        : 'Saved. The hourly email is off.',
                });
            },
            error: (err) => {
                this.saving = false;
                this.fail(err, 'Could not save');
            },
        });
    }

    sendTest() {
        if (this.dirty) {
            this.toast.add({
                severity: 'warn',
                summary: 'Save first',
                detail: 'The test email goes to the saved addresses. Save your changes first.',
            });
            return;
        }
        this.testing = true;
        this.reportMail.sendTest(this.branch()).subscribe({
            next: (res: any) => {
                this.testing = false;
                this.toast.add({
                    severity: 'success',
                    summary: 'Test email sent',
                    detail: `Sent to ${res.sent_to.length} address${res.sent_to.length == 1 ? '' : 'es'}.`,
                });
                this.load();
            },
            error: (err) => {
                this.testing = false;
                this.fail(err, 'The test email could not be sent');
                this.load(); // shows the failure under "Last email"
            },
        });
    }

    // ------------------------------------------------------------ display

    hourLabel(hour: number): string {
        return `${hour % 12 === 0 ? 12 : hour % 12}:00 ${hour < 12 ? 'AM' : 'PM'}`;
    }

    /** "2025-03-10 14" (an India-time hour) as "10 Mar, 2:00 PM" */
    slotLabel(slot: string): string {
        const [day, hour] = (slot ?? '').split(' ');
        const [, m, d] = (day ?? '').split('-').map(Number);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        if (!m || !d || hour === undefined) {
            return slot ?? '';
        }
        return `${d} ${months[m - 1]}, ${this.hourLabel(Number(hour))}`;
    }

    // ------------------------------------------------------------- helpers

    private emptyModel(): ReportMailSettings {
        return {
            enabled: false,
            recipients: [],
            from_hour: 9,
            to_hour: 23,
            only_logged_in: false,
            skip_if_unchanged: false,
        };
    }

    private editable(): ReportMailSettings {
        const m = this.model;
        return {
            enabled: !!m.enabled,
            recipients: [...m.recipients],
            from_hour: m.from_hour,
            to_hour: m.to_hour,
            only_logged_in: !!m.only_logged_in,
            skip_if_unchanged: !!m.skip_if_unchanged,
        };
    }

    // The same rules the server applies, so people hear about a problem straight away.
    private problem(): string | null {
        if (this.model.enabled && this.model.recipients.length === 0) {
            return 'Add at least one email address before switching it on.';
        }
        if (this.model.recipients.length > MAX_RECIPIENTS) {
            return `At most ${MAX_RECIPIENTS} email addresses.`;
        }
        if (this.model.from_hour > this.model.to_hour) {
            return 'The first hour must not be after the last hour.';
        }
        return null;
    }

    private apply(settings: ReportMailSettings) {
        this.model = {
            enabled: !!settings.enabled,
            recipients: [...(settings.recipients ?? [])],
            from_hour: settings.from_hour ?? 9,
            to_hour: settings.to_hour ?? 23,
            only_logged_in: !!settings.only_logged_in,
            skip_if_unchanged: !!settings.skip_if_unchanged,
        };
        this.original = JSON.stringify(this.editable());
        this.saved = !!settings.saved;
        this.lastSentAt = settings.last_sent_at ?? null;
        this.lastStatus = settings.last_status ?? null;
        this.lastError = settings.last_error ?? null;
    }

    private fail(err: any, fallback: string) {
        const message = err?.error?.message;
        this.toast.add({
            severity: 'error',
            summary: fallback,
            detail: Array.isArray(message) ? message.join(', ') : message ?? '',
        });
    }
}
