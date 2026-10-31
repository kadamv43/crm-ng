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

    // the company's staff, with who logged in today
    staff(branch?: string) {
        return this.httpService.get(this.url('staff', branch));
    }

    detail(id: string, branch?: string) {
        return this.httpService.get(this.url(encodeURIComponent(id), branch));
    }

    create(body: { name: string; staff: string[]; count: number }, branch?: string) {
        return this.httpService.post(this.url('', branch), body);
    }

    nextRound(id: string, branch?: string) {
        return this.httpService.post(this.url(`${encodeURIComponent(id)}/next-round`, branch), {});
    }

    close(id: string, branch?: string) {
        return this.httpService.post(this.url(`${encodeURIComponent(id)}/close`, branch), {});
    }
}
