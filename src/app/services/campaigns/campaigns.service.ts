import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';

export interface CampaignStaff {
    _id: string;
    username: string;
    name: string;
    present: boolean;
}

// Lead rotation campaigns. An admin works on their own company; superadmin
// names the company with `branch`.
@Injectable({
    providedIn: 'root',
})
export class CampaignsService {
    baseUrl = 'campaigns';
    constructor(private httpService: HttpService) {}

    private url(path: string, branch?: string) {
        return (
            this.baseUrl +
            (path ? `/${path}` : '') +
            (branch ? `?branch=${encodeURIComponent(branch)}` : '')
        );
    }

    list(branch?: string) {
        return this.httpService.get(this.url('', branch));
    }

    options(branch?: string) {
        return this.httpService.get(this.url('options', branch));
    }

    // the company's staff, with who logged in today
    staff(branch?: string) {
        return this.httpService.get(this.url('staff', branch));
    }

    detail(id: string, branch?: string) {
        return this.httpService.get(this.url(encodeURIComponent(id), branch));
    }

    create(
        body: { name: string; staff: string[]; count: number; auto_assignment?: boolean; interval_minutes?: number },
        branch?: string
    ) {
        return this.httpService.post(this.url('', branch), body);
    }

    createFromExcel(
        input: {
            name: string;
            staff: string[];
            file: File;
            auto_assignment?: boolean;
            interval_minutes?: number;
        },
        branch?: string
    ) {
        const form = new FormData();
        form.append('name', input.name);
        form.append('staff', JSON.stringify(input.staff));
        form.append('file', input.file);
        form.append('auto_assignment', String(input.auto_assignment ?? false));
        if (input.interval_minutes !== undefined) {
            form.append('interval_minutes', String(input.interval_minutes));
        }
        return this.httpService.post(this.url('import-excel', branch), form);
    }

    nextRound(id: string, branch?: string) {
        return this.httpService.post(this.url(`${encodeURIComponent(id)}/next-round`, branch), {});
    }

    close(id: string, branch?: string) {
        return this.httpService.post(this.url(`${encodeURIComponent(id)}/close`, branch), {});
    }
}
