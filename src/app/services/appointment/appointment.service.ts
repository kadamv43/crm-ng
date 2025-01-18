import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class AppointmentService {
    baseUrl = 'appointments';
    constructor(private httpService: HttpService) {}

    create(user) {
        const url = this.baseUrl;
        return this.httpService.post(url, user);
    }

    update(id: string, user) {
        const url = `${this.baseUrl}/${id}`;
        return this.httpService.patch(url, user);
    }

    getAll(params) {
        const url = this.baseUrl;
        return this.httpService.get(url, params);
    }

    getAppointmentsByPatientId(id) {
        const url = `${this.baseUrl}/patient/${id}`;
        return this.httpService.get(url);
    }

    findById(id: string) {
        const url = `${this.baseUrl}/${id}`;
        return this.httpService.get(url);
    }

    delete(id: string) {
        const url = `${this.baseUrl}/${id}`;
        return this.httpService.delete(url);
    }

    deleteReport(id: string, image_id: number) {
        const url = `${this.baseUrl}/reports/${id}`;
        return this.httpService.patch(url, { image_id });
    }

    searchBy(params: HttpParams) {
        const url = `${this.baseUrl}/search`;
        return this.httpService.get(url, params);
    }
}
