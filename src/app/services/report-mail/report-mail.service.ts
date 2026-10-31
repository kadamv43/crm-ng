import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';

export interface ReportMailSettings {
    saved?: boolean;
    enabled: boolean;
    recipients: string[];
    from_hour: number;
    to_hour: number;
    only_logged_in: boolean;
    skip_if_unchanged: boolean;
    last_sent_at?: string | null;
    last_status?: 'SENT' | 'FAILED' | 'SKIPPED' | 'SENDING' | null;
    last_error?: string | null;
}

// The hourly smart-view email. An admin works on their own company; superadmin
// names the company with `branch`.
@Injectable({
    providedIn: 'root',
})
export class ReportMailService {
    baseUrl = 'report-mail';
    constructor(private httpService: HttpService) {}

    private url(path: string, branch?: string) {
        return `${this.baseUrl}/${path}` + (branch ? `?branch=${encodeURIComponent(branch)}` : '');
    }

    getSettings(branch?: string) {
        return this.httpService.get(this.url('settings', branch));
    }

    saveSettings(settings: Partial<ReportMailSettings>, branch?: string) {
        return this.httpService.put(this.url('settings', branch), settings);
    }

    // Sends the real email to the saved addresses right now.
    sendTest(branch?: string) {
        return this.httpService.post(this.url('test', branch), {});
    }

    getLogs(branch?: string) {
        return this.httpService.get(this.url('logs', branch));
    }
}
