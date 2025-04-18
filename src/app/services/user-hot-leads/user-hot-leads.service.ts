import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class UserHotLeadsService {
    baseUrl = 'user-hot-leads';
    constructor(private httpService: HttpService) {}

    create(user) {
        const url = this.baseUrl;
        return this.httpService.postWithFormData(url, user);
    }

    createBulk(user) {
        const url = this.baseUrl + '/bulk';
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
