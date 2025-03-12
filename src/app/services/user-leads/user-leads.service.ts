import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class UserLeadsService {
    baseUrl = 'user-leads';
    constructor(private httpService: HttpService) {}

    create(user) {
        const url = this.baseUrl;
        return this.httpService.postWithFormData(url, user);
    }

    createBulk(user) {
        const url = this.baseUrl + '/bulk';
        return this.httpService.post(url, user);
    }

    deleteBulk(user) {
        const url = this.baseUrl + '/delete-bulk';
        return this.httpService.post(url, user);
    }

    update(id: string, user) {
        const url = `${this.baseUrl}/${id}`;
        return this.httpService.patchWithFormData(url, user);
    }

    importExcel(user) {
        const url = `${this.baseUrl}/import-excel`;
        return this.httpService.postWithFormData(url, user);
    }

    getAll(params) {
        const url = this.baseUrl;
        return this.httpService.get(url, params);
    }

    findById(id: string) {
        const url = `${this.baseUrl}/${id}`;
        return this.httpService.get(url);
    }

    getMyLeads(params) {
        const url = `${this.baseUrl}/my-leads`;
        return this.httpService.get(url, params);
    }

    getMyHotLeads(params) {
        const url = `${this.baseUrl}/my-hot-leads`;
        return this.httpService.get(url, params);
    }

    getAssignedHotLeads(params) {
        const url = `${this.baseUrl}/assigned-hot-leads`;
        return this.httpService.get(url, params);
    }

    getAssignedLeads(params) {
        const url = `${this.baseUrl}/assigned-leads`;
        return this.httpService.get(url, params);
    }

    deleteUserLeads(params) {
        const url = `${this.baseUrl}/delete-bulk`;
        return this.httpService.get(url, params);
    }

    getLeadHistory(params) {
        const url = `${this.baseUrl}/get-lead-history`;
        return this.httpService.get(url, params);
    }

    getMyFollowUp(params) {
        const url = `${this.baseUrl}/my-follow-up`;
        return this.httpService.get(url, params);
    }

    getLastWeekFreeTrial(params) {
        const url = `${this.baseUrl}/last-week-free-trials`;
        return this.httpService.get(url, params);
    }

    delete(id: string) {
        const url = `${this.baseUrl}/${id}`;
        return this.httpService.delete(url);
    }

    searchBy(params: HttpParams) {
        const url = `${this.baseUrl}/search`;
        return this.httpService.get(url, params);
    }

    globalSearch(query) {
        const url = `${this.baseUrl}/global-search/?q=${query}`;
        return this.httpService.get(url);
    }
}
