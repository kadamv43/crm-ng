// http.service.ts
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { NetworkService } from './network/network.service';

@Injectable({
    providedIn: 'root',
})
export class HttpService {
    private baseUrl: string = environment.baseUrl;

  constructor(private http: HttpClient, private network: NetworkService) {}

  setBaseUrl(url: string) {
    this.baseUrl = url;
    console.log('🌐 Base URL set to:', url);
  }

  get currentUploadPath(): string {
    return this.network.currentUploadPath;
  }

  get(url: string, params?: HttpParams, headers?: HttpHeaders) {
    return this.http.get(this.baseUrl + url, { headers, params });
  }

  post(url: string, body: any) {
    return this.http.post(this.baseUrl + url, body);
  }

  postWithFormData(url: string, body: any) {
    return this.http.post(this.baseUrl + url, body, {
      headers: new HttpHeaders({ enctype: 'multipart/form-data' }),
    });
  }

  patch(url: string, body: any) {
    return this.http.patch(this.baseUrl + url, body);
  }

  patchWithFormData(url: string, body: any) {
    return this.http.patch(this.baseUrl + url, body, {
      headers: new HttpHeaders({ enctype: 'multipart/form-data' }),
    });
  }

  delete(url: string) {
    return this.http.delete(this.baseUrl + url);
  }
}
