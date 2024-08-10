import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class HttpService {
    constructor(private http: HttpClient) {}

    get(url: string, params?: HttpParams, headers?: HttpHeaders) {

        return this.http.get(environment.baseUrl + url, {
            headers,
            params,
        });
    }

    post(url: string, body: any) {
        return this.http.post(environment.baseUrl + url, body);
    }

    patch(url: string, body: any) {
        return this.http.patch(environment.baseUrl + url, body);
    }

    delete(url: string) {
        return this.http.delete(environment.baseUrl + url);
    }
}
