import { Component, OnInit } from '@angular/core';
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
    selectedStatus = '';
    selectedType = '';
    selectedDate = [];
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
    selectedCompany = '';
    employees = [];
    admins = [];
    companies = [];
    tlList = [];
    visible;
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
        private router: Router
    ) {
        this.searchSubject
            .pipe(debounceTime(400), distinctUntilChanged())
            .subscribe((value) => {
                this.searchText = value;
                this.queryParams['search'] = this.searchText;
                let data = { first: 0, rows: 10 };
                this.loadAppointments(data);
            });
    }

    onLeadTypeChange(event: any) {
        console.log('ss');
        this.selectedType = event.value;
        this.queryParams['lead_type'] = event.value;
        let data = { first: 0, rows: 10 };
        this.loadAppointments(data);
    }

    onStatusChange(event: any) {
        console.log('ss');
        this.selectedStatus = event.value;
        this.queryParams['status'] = event.value;
        let data = { first: 0, rows: 10 };
        this.loadAppointments(data);
    }

    onDateChange(value: any) {
        this.selectedDate = value;

        if (this.selectedDate[0]) {
            this.queryParams['from'] = this.convertToUTC(this.selectedDate[0]);
        }

        if (this.selectedDate[1]) {
            this.queryParams['to'] = this.convertToUTC(this.selectedDate[1]);
        }

        let data = { first: 0, rows: 10 };
        this.loadAppointments(data);
    }

    selectTodaysDate() {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        this.selectedDate = [yesterday, today];

        if (this.selectedDate[0]) {
            this.queryParams['from'] = this.convertToUTC(this.selectedDate[0]);
        }

        if (this.selectedDate[1]) {
            this.queryParams['to'] = this.convertToUTC(this.selectedDate[1]);
        }
    }

    onChangeFilter(event, dt) {
        this.selectedEmployee = event.value;
        this.loadAppointments(dt);
    }

    onChangeCompany(event, dt) {
        this.selectedCompany = event.value;
        this.getTlList();
        this.loadAppointments(dt);
    }
    ngOnInit() {
        this.route.queryParams.subscribe((data) => {
            this.selectTodaysDate();
            this.searchText = data['search'] ?? '';
            this.selectedStatus = data['status'] ?? '';
            if (data['from'] && data['to']) {
                this.selectedDate[0] = new Date(data['from']);
                this.selectedDate[1] = new Date(data['to']);
            }
            if (data['from'] && !data['to']) {
                this.selectedDate[1] = null;
                this.selectedDate[0] = new Date(data['from']);
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

    onChangeTL(event, dt) {
        // this.selectedAdmin = event.value;
        this.showTlList = true;
        this.selectedEmployee = event?.value;
        this.loadAppointments(dt);
        this.getEmployees(this.selectedCompany, event.value);
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
                    // this.getDashBoard();
                    this.getTlList();
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
            branch,
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

    convertToUTC(date: string): string {
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

    loadAppointments(event: any) {
        this.loading = true;

        const page = event.first / event.rows;
        const size = event.rows;

        let params = {};

        if (this.searchText != '') {
            params['q'] = this.searchText;
        }

        if (this.selectedStatus) {
            params['status'] = this.selectedStatus;
        }

        if (this.selectedDate && this.selectedDate[0]) {
            params['from'] = this.convertToUTC(this.selectedDate[0]);
        }

        if (this.selectedDate && this.selectedDate[1]) {
            params['to'] = this.convertToUTC(this.selectedDate[1]);
        }

        if (this.loggedInUserBranch) {
            params['branch'] = this.loggedInUserBranch?._id;
        } else {
            params['branch'] = this.selectedCompany;
        }
        if (this.selectedEmployee) {
            params['user'] = this.selectedEmployee;
        } else {
            params['user'] = localStorage.getItem('userId');
        }

        if (this.selectedType) {
            params['lead_type'] = this.selectedType;
        }

        params['page'] = page;
        params['size'] = size;

        let queryParams = this.commonService.getHttpParamsByJson(params);
        this.dashboardService.getReports(queryParams).subscribe((data: any) => {
            this.appointments = data.data;
            this.totalRecords = data.total;
            this.loading = false;
        });
    }

    onSearchName(value: any) {
        this.searchSubject.next(value); // Push the value into the subject
    }

    async clear(event) {
        this.selectedStatus = '';
        this.searchText = '';
        let data = { first: 0, rows: 10 };
        this.loadAppointments(data);
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

    exportExcel() {
        console.log(this.appointments);
        const doctors = this.appointments.map((item) => {
            return {
                lead_type: item.is_hot_lead ? 'Hot Lead' : 'Normal Lead',
                username: item.userDetails?.username,
                mobile: item.mobile,
                name: item?.payment?.name,
                city: item.city,
                status: item.status,
            };
        });
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(doctors);
            const workbook = {
                Sheets: { data: worksheet },
                SheetNames: ['data'],
            };
            const excelBuffer: any = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array',
            });
            this.saveAsExcelFile(excelBuffer, 'report');
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
