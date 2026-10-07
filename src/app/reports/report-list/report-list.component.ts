import { Component, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AppointmentService } from 'src/app/services/appointment/appointment.service';
import { AuthService } from 'src/app/services/auth.service';
import * as FileSaver from 'file-saver';
import { CommonService } from 'src/app/services/common/common.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DatePipe } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { UploadReportsComponent } from 'src/app/appointments/upload-reports/upload-reports.component';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { UsersService } from 'src/app/services/users/users.service';
import { BranchesService } from 'src/app/services/branches/branches.service';
import { UserLeadsService } from 'src/app/services/user-leads/user-leads.service';
import { ExpectedPaymentFormComponent } from 'src/app/leads/expected-payment-form/expected-payment-form.component';
import { CallbackFormComponent } from 'src/app/leads/callback-form/callback-form.component';
import { FreeTrialFormComponent } from 'src/app/leads/free-trial-form/free-trial-form.component';

// Keep in sync with MAX_REPORT_EXPORT_ROWS in the backend.
export const MAX_EXPORT_ROWS = 50000;

@Component({
    selector: 'app-report-list',
    templateUrl: './report-list.component.html',
    styleUrl: './report-list.component.scss',
    providers: [ConfirmationService, MessageService, DialogService, DatePipe],
})
export class ReportListComponent {
    private searchSubject: Subject<string> = new Subject();

    leadTypes = [
        { name: 'Select Lead Type', code: null },
        { name: 'Normal Lead', code: 'normal_lead' },
        { name: 'Hot Lead', code: 'hot_lead' },
    ];

    statusList = [
        { name: 'Select Status', code: null },
        { name: 'FRESH', code: 'FRESH' },
        { name: 'CALL BACK', code: 'CALLBACK' },
        { name: 'RINGING', code: 'RINGING' },
        { name: 'SWITCH OFF', code: 'SWITCHED_OFF' },
        { name: 'DEAD', code: 'DEAD' },
        { name: 'FREE TRIAL', code: 'FREE_TRIAL' },
        { name: 'NOT INTERESTED', code: 'NOT_INTERESTED' },
        { name: 'PAYMENT DONE', code: 'PAYMENT_DONE' },
        { name: 'EXPECTED PAYMENT', code: 'EXPECTED_PAYMENT' },
        { name: 'LOSS', code: 'LOSS' },
    ];

    statusList2 = [
        { name: 'Select Status', code: null },
        { name: 'CALL BACK', code: 'CALLBACK' },
        { name: 'RINGING', code: 'RINGING' },
        { name: 'SWITCH OFF', code: 'SWITCHED_OFF' },
        { name: 'DEAD', code: 'DEAD' },
        { name: 'FREE TRIAL', code: 'FREE_TRIAL' },
        { name: 'NOT INTERESTED', code: 'NOT_INTERESTED' },
        { name: 'PAYMENT DONE', code: 'PAYMENT_DONE' },
        { name: 'EXPECTED PAYMENT', code: 'EXPECTED_PAYMENT' },
        { name: 'LOSS', code: 'LOSS' },
    ];

    display = false;
    excel = false;
    selectedStatus = '';
    selectedType = '';
    selectedDate: any[] = [];
    searchText = '';

    statuses: any[] = [];

    rowGroupMetadata: any;

    activityValues: number[] = [0, 100];

    isExpanded: boolean = false;

    idFrozen: boolean = false;

    loading: boolean = false;

    appointments: any = [];

    role = '';

    minDate;
    selectedUser;

    totalRecords = 0;

    showTlList = false;

    ref: DynamicDialogRef | undefined;

    queryParams = {};

    tableEvent;

    selectedStatusName;

    loggedInUserBranch;
    selectedEmployee = '';
    selectedTL = '';
    selectedCompany = '';
    employees = [];
    admins = [];
    companies = [];
    tlList = [];
    visible;
    @ViewChild('dt1') table: Table;
    constructor(
        private appointmentService: AppointmentService,
        private dashboardService: DashboardService,
        private authService: AuthService,
        private commonService: CommonService,
        private dialogService: DialogService,
        private datePipe: DatePipe,
        private branchService: BranchesService,
        private userService: UsersService,
        private userLeadService: UserLeadsService,
        private route: ActivatedRoute,
        private router: Router,
        private messageService: MessageService
    ) {
        this.searchSubject
            .pipe(debounceTime(400), distinctUntilChanged())
            .subscribe((value) => {
                this.searchText = value;
                this.queryParams['search'] = this.searchText;
                this.applyFilters();
            });
    }

    // Reload from the first page; keeps the table's paginator in sync.
    applyFilters(dt?: Table) {
        const table = dt ?? this.table;
        if (table) {
            table.first = 0;
        }
        this.loadAppointments({ first: 0, rows: table?.rows ?? 100 });
    }

    onLeadTypeChange(event: any, dt?: Table) {
        this.selectedType = event.value;
        this.queryParams['lead_type'] = event.value;
        this.applyFilters(dt);
    }

    onStatusChange(event: any, dt?: Table) {
        this.selectedStatus = event.value;
        this.queryParams['status'] = event.value;
        this.applyFilters(dt);
    }

    onDateChange(value: any, dt?: Table) {
        this.selectedDate = value ?? [];
        const [from, to] = this.selectedDate;

        // A range is only complete once both ends are chosen (or both cleared).
        if ((from && !to) || (!from && to)) {
            return;
        }

        if (from) {
            this.queryParams['from'] = this.convertToUTC(this.startOfDay(from));
            this.queryParams['to'] = this.convertToUTC(this.endOfDay(to));
        } else {
            delete this.queryParams['from'];
            delete this.queryParams['to'];
        }

        this.applyFilters(dt);
    }

    startOfDay(date: any): Date {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    endOfDay(date: any): Date {
        const d = new Date(date);
        d.setHours(23, 59, 59, 999);
        return d;
    }

    selectTodaysDate() {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        this.selectedDate = [yesterday, today];
    }

    onChangeFilter(event, dt?: Table) {
        this.selectedEmployee = event.value ?? '';
        this.applyFilters(dt);
    }

    onChangeCompany(event, dt?: Table) {
        this.selectedCompany = event.value;
        this.selectedTL = '';
        this.selectedEmployee = '';
        this.tlList = [];
        this.employees = [];
        this.getTlList();
        this.applyFilters(dt);
    }

    ngOnInit() {
        this.route.queryParams.subscribe((data) => {
            this.searchText = data['search'] ?? '';
            this.selectedStatus = data['status'] ?? '';
            if (data['from']) {
                this.selectedDate = [
                    new Date(data['from']),
                    data['to'] ? new Date(data['to']) : null,
                ];
            } else {
                this.selectTodaysDate();
            }

            this.queryParams = { ...data };
        });
        this.role = this.authService.getRole();

        const branchData = localStorage.getItem('branch');
        try {
            this.loggedInUserBranch = branchData
                ? JSON.parse(branchData)
                : null;
        } catch (error) {
            // console.error('Error parsing branchData:', error);
            this.loggedInUserBranch = null;
        }

        if (this.role == 'superadmin') {
            this.getCompanies();
        } else {
            // this.loadAppointments();
            this.getTlList();
        }

        if (this.role == 'teamlead') {
            this.getEmployeesByTL();
        }
    }

    onChangeTL(event, dt?: Table) {
        this.showTlList = true;
        this.selectedTL = event?.value ?? '';
        this.selectedEmployee = '';
        this.employees = [];
        if (this.selectedTL) {
            this.getEmployees(this.selectedCompany, this.selectedTL);
        }
        this.applyFilters(dt);
    }

    showDialog(customer, event, tableEvent) {
        this.selectedUser = customer;
        console.log(this.selectedUser);
        this.tableEvent = tableEvent;
        customer.selectedStatus = event.value;

        this.selectedStatusName = this.statusList.find((item) => {
            return item?.code == customer.selectedStatus;
        });
        this.visible = true;
    }

    changeStatus() {
        let customer: any = this.selectedUser;
        let value = customer.selectedStatus;
        let tableEvent = this.tableEvent;
        this.visible = false;
        if (value == 'FREE_TRIAL') {
            this.openFreeTrialDialog(customer, tableEvent);
        } else if (value == 'CALLBACK') {
            this.openCallBackDialog(customer, tableEvent);
        } else if (value == 'EXPECTED_PAYMENT') {
            this.openDialog(customer, tableEvent);
        } else {
            this.userLeadService
                .update(customer._id, {
                    status: value,
                })
                .subscribe({
                    next: (res) => {
                        this.loadAppointments(tableEvent);
                        console.log(res);
                    },
                });
        }
    }

    getEmployeesByTL() {
        let params = {
            teamlead: localStorage.getItem('userId'),
            role: 'employee',
        };

        let queryParams = this.commonService.getHttpParamsByJson(params);

        this.userService.searchBy(queryParams).subscribe({
            next: (res: any) => {
                this.employees = res.map((item) => {
                    return { name: item?.username, code: item?._id };
                });
            },
        });
    }
    getCompanies() {
        let params = {
            page: 0,
            size: 100,
        };
        this.branchService.getAll(params).subscribe({
            next: (res: any) => {
                this.companies = res.data.map((item) => {
                    return { name: item?.name, code: item?._id };
                });

                if (this.role === 'superadmin' && this.companies?.length > 0) {
                    this.selectedCompany = this.companies[0].code; // Set first option by default
                    this.getTlList();
                    this.applyFilters();
                }
            },
        });
    }

    getAdmins(branch) {
        let params = {
            page: 0,
            role: 'admin',
            size: 100,
            branch,
        };
        this.userService.getAll(params).subscribe({
            next: (res: any) => {
                this.admins = res.data.map((item) => {
                    return { name: item?.username, code: item?._id };
                });
            },
        });
    }

    getEmployees(branch, tl) {
        let params = {
            page: 0,
            role: 'employee',
            size: 100,
            branch:
                this.role == 'superadmin'
                    ? branch
                    : this.loggedInUserBranch?._id,
            teamlead: tl,
        };
        this.userService.getAll(params).subscribe({
            next: (res: any) => {
                this.employees = res.data.map((item) => {
                    return { name: item?.username, code: item?._id };
                });
            },
        });
    }

    getTlList() {
        let params = {
            page: 0,
            size: 100,
            role: 'teamlead',
        };

        if (this.role == 'admin') {
            params['branch'] = this.loggedInUserBranch?._id;
        } else {
            params['branch'] = this.selectedCompany;
        }

        this.userService.getAll(params).subscribe({
            next: (res: any) => {
                this.tlList = res.data.map((item) => {
                    return { name: item?.username, code: item?._id };
                });
            },
        });
    }

    convertToUTC(date: Date | string): string {
        const localDate = new Date(date);
        return localDate.toISOString(); // This converts it to UTC in ISO format
    }

    openCallBackDialog(customer: any, tableEvent) {
        this.ref = this.dialogService.open(CallbackFormComponent, {
            data: {
                customer,
            },
            width: '50%',
            header: 'CallBack Form',
        });

        this.ref.onClose.subscribe((result) => {
            console.log('closed');
            setTimeout(() => {
                this.loadAppointments(tableEvent);
            }, 2000);
        });
    }

    openFreeTrialDialog(customer: any, tableEvent) {
        this.ref = this.dialogService.open(FreeTrialFormComponent, {
            data: {
                customer,
            },
            width: '50%',
            header: 'FreeTrial Form',
        });

        this.ref.onClose.subscribe((result) => {
            console.log('closed');
            setTimeout(() => {
                this.loadAppointments(tableEvent);
            }, 2000);
        });
    }

    buildReportParams(): any {
        let params = {};

        if (this.searchText != '') {
            params['q'] = this.searchText;
        }

        if (this.selectedStatus) {
            params['status'] = this.selectedStatus;
        }

        if (this.selectedDate && this.selectedDate[0]) {
            params['from'] = this.convertToUTC(
                this.startOfDay(this.selectedDate[0])
            );
            params['to'] = this.convertToUTC(
                this.endOfDay(this.selectedDate[1] ?? this.selectedDate[0])
            );
        }

        // Superadmin picks the company; everyone else is tied to their own.
        if (this.role == 'superadmin') {
            params['branch'] = this.selectedCompany;
        } else {
            params['branch'] = this.loggedInUserBranch?._id;
        }

        // Narrowest selection wins: employee, then team lead, then self.
        params['user'] =
            this.selectedEmployee ||
            this.selectedTL ||
            localStorage.getItem('userId');

        if (this.selectedType) {
            params['lead_type'] = this.selectedType;
        }

        return params;
    }

    loadAppointments(event: any) {
        this.tableEvent = event;

        // Superadmin reports are per company; wait until one is selected.
        if (this.role == 'superadmin' && !this.selectedCompany) {
            this.loading = false;
            return;
        }

        this.loading = true;

        const page = event.first / event.rows;
        const size = event.rows;

        const params = this.buildReportParams();
        params['page'] = page;
        params['size'] = size;

        let queryParams = this.commonService.getHttpParamsByJson(params);
        this.dashboardService.getReports(queryParams).subscribe({
            next: (data: any) => {
                this.appointments = data.data;
                this.totalRecords = data.total;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            },
        });
    }

    onSearchName(value: any) {
        this.searchSubject.next(value); // Push the value into the subject
    }

    clear(dt?: Table) {
        this.selectedStatus = '';
        this.selectedType = '';
        this.searchText = '';
        this.selectTodaysDate(); // back to the default view shown when the page opens
        this.selectedTL = '';
        this.selectedEmployee = '';
        this.queryParams = {};
        if (this.role != 'teamlead') {
            this.employees = [];
        }
        this.applyFilters(dt);
    }

    openDialog(customer: any, tableEvent) {
        this.ref = this.dialogService.open(ExpectedPaymentFormComponent, {
            data: {
                customer,
            },
            width: '50%',
            header: 'Expected Payment Form',
        });

        this.ref.onClose.subscribe((result) => {
            console.log('closed');
            setTimeout(() => {
                this.loadAppointments(tableEvent);
            }, 2000);
        });
    }

    formatDate(value: any): string {
        return value ? this.datePipe.transform(value, 'dd-MM-yyyy') : '';
    }

    formatPaymentDetails(payment: any): string {
        const d = payment?.payment_details;
        if (!d) {
            return '';
        }
        const join = (...parts: any[]) =>
            parts.filter((part) => part).join(' | ');
        switch (payment?.payment_mode) {
            case 'LINK':
                return join(d.name, d.link);
            case 'BANK':
                return join(
                    d.account_holder,
                    d.account_number,
                    d.bank_name,
                    d.ifsc_code
                );
            case 'UPI':
                return join(d.upi_id, d.upi_number);
            default:
                return '';
        }
    }

    // One row per lead, columns in the same order as the report table.
    toExportRow(item: any) {
        return {
            'Lead Type': item.is_hot_lead ? 'Hot Lead' : 'Normal Lead',
            Username: item.userDetails?.username ?? '',
            Mobile: item.mobile ?? '',
            Name: item.name ?? '',
            City: item.city ?? '',
            Status: item.status ?? '',
            'Created Date': this.formatDate(item.created_at),
            'Free Trial Investment': item.free_trial?.investment ?? '',
            'Free Trial Date': this.formatDate(item.free_trial?.free_trial_date),
            'Free Trial Remark': item.free_trial?.remark ?? '',
            'Free Trial Options': Array.isArray(item.free_trial?.options)
                ? item.free_trial.options.join(', ')
                : item.free_trial?.options ?? '',
            'Expected Payment': item.follow_up?.expected_payment ?? '',
            'Expected Payment Date': this.formatDate(
                item.follow_up?.expected_payment_date
            ),
            'Paid Amount': item.payment?.payment_amount ?? '',
            'Payment Mode': item.payment?.payment_mode ?? '',
            'Payment Details': this.formatPaymentDetails(item.payment),
            'Payment Date': this.formatDate(item.payment?.payment_date),
        };
    }

    // Exports every lead matching the current filters, not just the visible page.
    exportExcel() {
        if (this.excel) {
            return; // an export is already running
        }

        if (this.role == 'superadmin' && !this.selectedCompany) {
            return;
        }

        if (this.totalRecords > MAX_EXPORT_ROWS) {
            this.showExportLimitMessage(this.totalRecords);
            return;
        }

        const params = this.buildReportParams();
        params['excel'] = true;
        this.excel = true;

        const queryParams = this.commonService.getHttpParamsByJson(params);
        this.dashboardService.getReports(queryParams).subscribe({
            next: (res: any) => {
                const rows = (res?.data ?? []).map((item) =>
                    this.toExportRow(item)
                );
                import('xlsx')
                    .then((xlsx) => {
                        const worksheet = xlsx.utils.json_to_sheet(rows, {
                            header: Object.keys(this.toExportRow({})),
                        });
                        const workbook = {
                            Sheets: { data: worksheet },
                            SheetNames: ['data'],
                        };
                        const excelBuffer: any = xlsx.write(workbook, {
                            bookType: 'xlsx',
                            type: 'array',
                        });
                        this.saveAsExcelFile(excelBuffer, 'report');
                    })
                    .catch(() => {
                        this.messageService.add({
                            key: 'tst',
                            severity: 'error',
                            summary: 'Export failed',
                            detail: 'Could not create the Excel file. Please try again.',
                        });
                    })
                    .finally(() => {
                        this.excel = false;
                    });
            },
            error: (err) => {
                this.excel = false;
                // The server enforces the same limit (e.g. data changed since the table loaded).
                if (err?.status === 400) {
                    this.showExportLimitMessage(null, err?.error?.message);
                }
            },
        });
    }

    showExportLimitMessage(total: number | null, serverMessage?: string) {
        this.messageService.add({
            key: 'tst',
            severity: 'warn',
            summary: 'Too many rows to export',
            detail:
                serverMessage ??
                `Export is limited to ${MAX_EXPORT_ROWS.toLocaleString('en-US')} rows but this report has ${total?.toLocaleString('en-US')}. Narrow the filters (date range, status, employee) and try again.`,
            life: 6000,
        });
    }

    saveAsExcelFile(buffer: any, fileName: string): void {
        let EXCEL_TYPE =
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        let EXCEL_EXTENSION = '.xlsx';
        const data: Blob = new Blob([buffer], {
            type: EXCEL_TYPE,
        });
        FileSaver.saveAs(
            data,
            fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION
        );
    }
}
