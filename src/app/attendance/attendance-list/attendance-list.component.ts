import { Component, OnInit } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { AttendanceService } from 'src/app/services/attendance/attendance.service';
import { AuthService } from 'src/app/services/auth.service';
import { BranchesService } from 'src/app/services/branches/branches.service';

// Attendance is simply "who logged in on the day". A day runs from 8 AM to
// 8 AM the next morning (India time), so the server decides which day a login
// belongs to; this page only shows it.
@Component({
    selector: 'app-attendance-list',
    templateUrl: './attendance-list.component.html',
    styleUrl: './attendance-list.component.scss',
})
export class AttendanceListComponent implements OnInit {
    role = '';
    loading = false;

    selectedDate: Date | null = null;
    maxDate = new Date();

    companies: { name: string; code: string }[] = [];
    selectedCompany = '';

    rows: any[] = [];
    total = 0;

    constructor(
        private attendanceService: AttendanceService,
        private branchService: BranchesService,
        private authService: AuthService
    ) {}

    ngOnInit() {
        this.role = this.authService.getRole();
        if (this.role == 'superadmin') {
            this.getCompanies();
        } else {
            this.load();
        }
    }

    getCompanies() {
        this.branchService.getAll({ page: 0, size: 100 }).subscribe({
            next: (res: any) => {
                this.companies = res.data.map((item) => ({
                    name: item?.name,
                    code: item?._id,
                }));
                if (this.companies.length > 0) {
                    this.selectedCompany = this.companies[0].code;
                }
                this.load();
            },
        });
    }

    onDateChange() {
        this.load();
    }

    onCompanyChange() {
        this.load();
    }

    load() {
        // superadmin picks a company, but must have one before asking
        if (this.role == 'superadmin' && !this.selectedCompany) {
            this.rows = [];
            this.total = 0;
            return;
        }

        let params = new HttpParams();
        if (this.selectedDate) {
            params = params.set('date', this.toYmd(this.selectedDate));
        }
        if (this.role == 'superadmin') {
            params = params.set('branch', this.selectedCompany);
        }

        this.loading = true;
        this.attendanceService.getAll(params).subscribe({
            next: (res: any) => {
                this.rows = res.data;
                this.total = res.total;
                // with no date chosen the server answers for the current
                // attendance day: show that day in the picker
                if (!this.selectedDate && res.date) {
                    this.selectedDate = this.fromYmd(res.date);
                }
                this.loading = false;
            },
            error: () => {
                this.rows = [];
                this.total = 0;
                this.loading = false;
            },
        });
    }

    fullName(row: any): string {
        const user = row?.user;
        return [user?.first_name, user?.last_name].filter((x) => x).join(' ');
    }

    toYmd(date: Date): string {
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
            date.getDate()
        )}`;
    }

    fromYmd(text: string): Date {
        const [y, m, d] = text.split('-').map(Number);
        return new Date(y, m - 1, d);
    }
}
