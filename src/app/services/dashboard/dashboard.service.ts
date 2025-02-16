import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class DashboardService {
    baseUrl = 'dashboard';
    constructor(private httpService: HttpService) {}

    create(user) {
        const url = this.baseUrl;
        return this.httpService.postWithFormData(url, user);
    }

    getTarget(params) {
        const url = this.baseUrl + '/target-details';
        return this.httpService.get(url, params);
    }

    getFreeTrial(params) {
        const url = this.baseUrl + '/free-trial';
        return this.httpService.get(url, params);
    }

    getTodaysPaymentDone(params) {
        const url = this.baseUrl + '/todays-payments-done';
        return this.httpService.get(url, params);
    }

    getSmartView(params) {
        const url = this.baseUrl + '/smart-view';
        return this.httpService.get(url, params);
    }

    getReports(params) {
        const url = this.baseUrl + '/reports';
        return this.httpService.get(url, params);
    }

    getTodaysExpectedPayment(params) {
        const url = this.baseUrl + '/todays-expected-payment';
        return this.httpService.get(url, params);
    }

    getCurrentMonthPaymentDone(params) {
        const url = this.baseUrl + '/current-month-payments-done';
        return this.httpService.get(url, params);
    }

    getPaymentDetails() {
        const url = this.baseUrl + '/payment-details';
        return this.httpService.get(url);
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
