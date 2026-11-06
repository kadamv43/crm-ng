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
        body: {
            name: string;
            staff: string[];
            count: number;
            lead_type?: 'NORMAL' | 'HOT';
        },
        branch?: string
    ) {
        return this.httpService.post(this.url('', branch), body);
    }

    createFromExcel(
        input: {
            name: string;
            staff: string[];
            file: File;
            lead_type?: 'NORMAL' | 'HOT';
        },
        branch?: string
    ) {
        const form = new FormData();
        if (input.lead_type) {
            form.append('lead_type', input.lead_type);
        }
        form.append('name', input.name);
        form.append('staff', JSON.stringify(input.staff));
        form.append('file', input.file);
        return this.httpService.post(this.url('import-excel', branch), form);
    }

    // the staff and the statuses are chosen again for every round
    nextRound(id: string, body: { staff: string[]; move_statuses: string[] }, branch?: string) {
        return this.httpService.post(this.url(`${encodeURIComponent(id)}/next-round`, branch), body);
    }

    close(id: string, branch?: string) {
        return this.httpService.post(this.url(`${encodeURIComponent(id)}/close`, branch), {});
    }
}
