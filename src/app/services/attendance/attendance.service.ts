import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { HttpService } from '../http.service';

@Injectable({
    providedIn: 'root',
})
export class AttendanceService {
    baseUrl = 'attendance';
    constructor(private httpService: HttpService) {}

    // Who logged in on a day. params: date ("2025-03-10", default is the
    // current attendance day) and, for superadmin, branch.
    getAll(params?: HttpParams) {
        return this.httpService.get(this.baseUrl, params);
    }
}
