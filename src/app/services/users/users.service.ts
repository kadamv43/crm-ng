import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class UsersService {
    baseUrl = 'users';
    constructor(private httpService: HttpService) {}

    create(user) {
        const url = this.baseUrl;
        return this.httpService.post(url, user);
    }

    update(id: string, user) {
        const url = `${this.baseUrl}/${id}`;
        return this.httpService.patch(url, user);
    }

    updateNote(data) {
        const url = `${this.baseUrl}/update-note`;
        return this.httpService.patch(url, data);
    }

    getUserDetails() {
        const url = `${this.baseUrl}/user-details`;
        return this.httpService.get(url);
    }

    getAll(params) {
        const url = this.baseUrl;
        return this.httpService.get(url, params);
    }

    findById(id: string) {
        const url = `${this.baseUrl}/${id}`;
        return this.httpService.get(url);
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
