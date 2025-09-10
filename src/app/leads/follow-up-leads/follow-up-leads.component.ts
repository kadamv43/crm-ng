import { Component } from '@angular/core';
import { Table } from 'primeng/table';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common/common.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DatePipe } from '@angular/common';
import * as FileSaver from 'file-saver';
import { BranchesService } from 'src/app/services/branches/branches.service';
import { HotLeadsService } from 'src/app/services/hot-leads/hot-leads.service';
import { LeadsService } from 'src/app/services/leads/leads.service';
import { UsersService } from 'src/app/services/users/users.service';
import { UserLeadsService } from 'src/app/services/user-leads/user-leads.service';
import { ExpectedPaymentComponent } from '../expected-payment/expected-payment.component';
import { ExpectedPaymentFormComponent } from '../expected-payment-form/expected-payment-form.component';
import { CallbackFormComponent } from '../callback-form/callback-form.component';
import { FreeTrialFormComponent } from '../free-trial-form/free-trial-form.component';

@Component({
    selector: 'app-follow-up-leads',
    templateUrl: './follow-up-leads.component.html',
    styleUrl: './follow-up-leads.component.scss',
    providers: [MessageService, ConfirmationService, DialogService, DatePipe],
})
export class FollowUpLeadsComponent {
    statusList = [
        { name: 'RINGING', code: 'RINGING' },
        { name: 'NOT INTERESTED', code: 'NOT_INTERESTED' },
        { name: 'EXPECTED PAYMENT', code: 'EXPECTED_PAYMENT' },
        { name: 'LOSS', code: 'LOSS' },
        { name: 'DEAD', code: 'DEAD' },
    ];

    bloodGroups = [
        { name: 'Rahul', code: 'Rahul' },
        { name: 'Sham', code: 'Sham' },
    ];
    display = false;
    selectedStatus = '';
    selectedDate = '';
    selectedUser = '';
    searchText = '';
    selectedProducts: any[] = [];

    isExpanded: boolean = false;

    idFrozen: boolean = false;

    loading: boolean = false;

    appointments: any = [];
    lastWeekFreetrials = [];
    totalFreeTrial = 0;
    visible = false;
    tableEvent;

    selectedStatusName;
    role = '';

    doctors = [];

    minDate;

    totalRecords = 0;

    users: any = [];

    ref: DynamicDialogRef | undefined;

    constructor(
        private userLeadsService: UserLeadsService,
        private router: Router,
        private authService: AuthService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private api: ApiService,
        private userService: UsersService,
        private commonService: CommonService,
        private dialogService: DialogService,
        private datePipe: DatePipe
    ) {}

    ngOnInit() {
        this.role = this.authService.getRole();
        this.getUsers();
    }

    logSelection() {
        console.log(this.selectedProducts);
    }

    getUsers() {
        const page = 0;
        const size = 50;

        let params = {};
        if (this.searchText != '') {
            params['q'] = this.searchText;
        }

        params['page'] = page;
        params['size'] = size;
        params['role'] = 'employee';

        let queryParams = this.commonService.getHttpParamsByJson(params);

        this.userService.getAll(queryParams).subscribe((data: any) => {
            this.users = data.data.map((element) => {
                return {
                    name: element?.first_name + ' ' + element?.last_name,
                    code: element?._id,
                };
            });
            this.totalRecords = data.total;
        });
    }

    loadBLogs(event: any) {
        this.loading = true;

        const page = event.first / event.rows;
        const size = event.rows;

        let params = {};

        if (this.searchText != '') {
            params['q'] = this.searchText;
        }

        if (this.selectedStatus != '') {
            params['status'] = this.selectedStatus;
        }

        if (this.selectedDate != '') {
            params['from'] = this.datePipe.transform(
                this.selectedDate[0],
                'yyyy-MM-dd'
            );
            params['to'] = this.datePipe.transform(
                this.selectedDate[1],
                'yyyy-MM-dd'
            );
        }

        params['page'] = page;
        params['size'] = size;
        params['status'] = 'FREE_TRIAL';

        let queryParams = this.commonService.getHttpParamsByJson(params);
        this.userLeadsService
            .getLastWeekFreeTrial(queryParams)
            .subscribe((data: any) => {
                this.lastWeekFreetrials = data.data;
                this.totalFreeTrial = data.total;
                this.loading = false;
            });
        this.userLeadsService
            .getMyFollowUp(queryParams)
            .subscribe((data: any) => {
                this.appointments = data.data;
                this.totalRecords = data.total;
                this.loading = false;
            });

        console.log('api called');
    }

    showDialog(customer, event, tableEvent) {
        this.selectedUser = customer;
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
            this.openDialog(customer, tableEvent);
        } else if (value == 'CALLBACK') {
            this.openCallBackDialog(customer, tableEvent);
        } else if (value == 'EXPECTED_PAYMENT') {
            this.openDialog(customer, tableEvent);
        } else {
            this.userLeadsService
                .update(customer._id, {
                    status: value,
                })
                .subscribe({
                    next: (res) => {
                        this.loadBLogs(tableEvent);
                        console.log(res);
                    },
                });
        }
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
                this.loadBLogs(tableEvent);
            }, 2000);
        });
    }

    refresh(event) {
        this.loading = true;
        console.log(event);
        this.loadBLogs(event);
    }

    editFreeTrial(customer: any, te: any) {
        this.ref = this.dialogService.open(FreeTrialFormComponent, {
            data: {
                customer,
            },
            width: '50%',
            header: 'Free Trial Form',
        });

        this.tableEvent = te;
        this.ref.onClose.subscribe((result: any) => {
            this.refresh(this.tableEvent);
        });
    }

    goTo(url) {
        this.router.navigateByUrl(url);
    }

    confirm2(event: Event, user) {
        this.confirmationService.confirm({
            key: 'confirm2',
            target: event.target || new EventTarget(),
            message: 'Are you sure that you want to proceed?',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.userLeadsService.delete(user._id).subscribe((res) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Deleted',
                        detail: 'Appointments Deleted Successfully',
                    });
                    let removedItemIndex = this.appointments.findIndex(
                        (item) => item._id == user._id
                    );
                    this.appointments.splice(removedItemIndex, 1);
                });
            },
            reject: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Rejected',
                    detail: 'Unable to delete Appointments',
                });
            },
        });
    }

    async clear(event) {
        this.selectedStatus = '';
        this.selectedDate = '';
        this.searchText = '';
        this.loadBLogs(event);
    }

    filter() {
        let params = {};
        if (this.searchText != '') {
            params['q'] = this.searchText;
        }

        if (this.selectedStatus != '') {
            params['status'] = this.selectedStatus;
        }

        if (this.selectedDate != '') {
            params['from'] = this.datePipe.transform(
                this.selectedDate[0],
                'yyyy-MM-dd'
            );
            params['to'] = this.datePipe.transform(
                this.selectedDate[1],
                'yyyy-MM-dd'
            );
        }

        let queryParams = this.commonService.getHttpParamsByJson(params);
        this.userLeadsService.getAll(queryParams).subscribe((res) => {
            this.appointments = res;
        });
    }
    async updateStatus(id, status) {
        this.userLeadsService.update(id, { status }).subscribe((res) => {
            this.messageService.add({
                // key: 'tst',
                severity: 'success',
                summary: 'Success Message',
                detail: 'Status updated successfully',
            });
        });
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
                this.loadBLogs(tableEvent);
            }, 2000);
        });
    }
    onStatusChange(customer, event, tableEvent) {
        let value = event?.value;

        if (value == 'EXPECTED_PAYMENT') {
            this.openDialog(customer, tableEvent);
        } else {
            this.userLeadsService
                .update(customer._id, {
                    status: event.value,
                })
                .subscribe({
                    next: (res) => {
                        this.loadBLogs(tableEvent);
                        console.log(res);
                    },
                });
        }
    }

    exportExcel() {
        const doctors = this.appointments.map((item) => {
            return {
                title: item.first_name,
                last_name: item.last_name,
                email: item.email,
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
            this.saveAsExcelFile(excelBuffer, 'staff');
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
