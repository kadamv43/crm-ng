import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { CommonService } from './common/common.service';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    constructor(
        private httpService: HttpService,
        private commonService: CommonService
    ) {}

    getAuthUserDetails() {
        const url = 'auth/details';
        return this.httpService.get(url);
    }
    createUser(user) {
        const url = 'users';
        return this.httpService.post(url, user);
    }

    updateUser(id: string, user) {
        const url = 'users/' + id;
        return this.httpService.patch(url, user);
    }

    getUsers() {
        const url = 'users';
        return this.httpService.get(url);
    }

    getUserById(id: string) {
        const url = 'users/' + id;
        return this.httpService.get(url);
    }

    deleteUser(id: string) {
        const url = 'users/' + id;
        return this.httpService.delete(url);
    }

    login(body: any) {
        const url = 'auth/login/';
        return this.httpService.post(url, body);
    }

    getProducts() {
        const url = 'products';
        return this.httpService.get(url);
    }

    getProductById(id: string) {
        const url = 'products/' + id;
        return this.httpService.get(url);
    }

    createProduct(user) {
        const url = 'products';
        return this.httpService.post(url, user);
    }

    updateProduct(id: string, product) {
        const url = 'products/' + id;
        return this.httpService.patch(url, product);
    }

    deleteProduct(id: string) {
        const url = 'products/' + id;
        return this.httpService.delete(url);
    }

    createDoctor(user) {
        const url = 'doctors';
        return this.httpService.post(url, user);
    }

    getDoctors() {
        const url = 'doctors';
        return this.httpService.get(url);
    }

    userSearchBy(params: HttpParams) {
        const url = 'users/search';
        return this.httpService.get(url, params);
    }

    forgotPassword(id: string) {
        const url = 'auth/forgot-password/' + id;
        return this.httpService.get(url);
    }

    changePassword(params) {
        const url = 'users/change-password/';
        return this.httpService.post(url, params);
    }

    resetPassword(id: string, params) {
        const url = 'auth/reset-password/' + id;
        return this.httpService.post(url, params);
    }

    getAppConfig() {
        const url = 'app-config';
        return this.httpService.get(url);
    }

    sendOTP(data: any) {
        const url = 'otp/send-otp';
        return this.httpService.post(url, data);
    }

    verifyOTp(data: any) {
        const url = 'otp/verify-otp';
        return this.httpService.post(url, data);
    }

    userSearchByEmail(params: HttpParams) {
        const url = 'auth/email/search';
        return this.httpService.get(url, params);
    }
}
