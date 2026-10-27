import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { HttpService } from '../http.service';

@Injectable({
    providedIn: 'root',
})
export class ContactsService {
    baseUrl = 'contacts';
    constructor(private httpService: HttpService) {}

    // Total unique leads (one per phone number) for the company.
    // Superadmin can pass { branch } to pick a company.
    stats(params?: HttpParams) {
        return this.httpService.get(`${this.baseUrl}/stats`, params);
    }

    // Everything known about one number: how often it was handed out and
    // worked, who last worked it, and the recent activity.
    lookup(mobile: string) {
        const params = new HttpParams().set('mobile', mobile);
        return this.httpService.get(`${this.baseUrl}/lookup`, params);
    }

    activity(contactId: string, params?: HttpParams) {
        return this.httpService.get(
            `${this.baseUrl}/${contactId}/activity`,
            params
        );
    }
}
