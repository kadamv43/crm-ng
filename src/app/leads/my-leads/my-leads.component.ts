import { Component } from '@angular/core';
import { Table } from 'primeng/table';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common/common.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DatePipe } from '@angular/common';
import { FileUploadFormComponent } from 'src/app/appointments/file-upload-form/file-upload-form.component';
import * as FileSaver from 'file-saver';
import { LeadsService } from 'src/app/services/leads/leads.service';
import { UsersService } from 'src/app/services/users/users.service';
import { UserLeadsService } from 'src/app/services/user-leads/user-leads.service';
import { FreeTrialFormComponent } from '../free-trial-form/free-trial-form.component';
import { CallbackFormComponent } from '../callback-form/callback-form.component';

@Component({
    selector: 'app-my-leads',
    templateUrl: './my-leads.component.html',
    styleUrl: './my-leads.component.scss',
    providers: [MessageService, ConfirmationService, DialogService, DatePipe],
})
export class MyLeadsComponent {
    visible = false;
    statusList = [
        // { name: 'SELECT OPTION', value: '' }, // Blank option
        { name: 'CALLBACK', code: 'CALLBACK' },
        { name: 'FREE TRIAL', code: 'FREE_TRIAL' },
        { name: 'RINGING', code: 'RINGING' },
        { name: 'SWITCHED OFF', code: 'SWITCHED_OFF' },
        { name: 'DEAD', code: 'DEAD' },
        { name: 'NOT REACHABLE', code: 'NOT_REACHABLE' },
        { name: 'NOT INTERESTED', code: 'NOT_INTERESTED' },
    ];

    bloodGroups = [
        { name: 'Rahul', code: 'Rahul' },
        { name: 'Sham', code: 'Sham' },
    ];
    display = false;
    selectedStatus = null;
    selectedDate = '';
    selectedUser = '';
    tableEvent;
    searchText = '';

    // loading = false;
    selectedProducts: any[] = [];

    isExpanded: boolean = false;

    idFrozen: boolean = false;

    loading: boolean = false;

    appointments: any = [];

    selectedStatusName;

    role = '';

    doctors = [];

    minDate;

    totalRecords = 0;

    users: any = [];

    ref: DynamicDialogRef | undefined;

    constructor(
        private leadsService: LeadsService,
        private userLeadService: UserLeadsService,
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
    }

    logSelection() {
        console.log(this.selectedProducts);
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
        params['status'] = 'FRESH';

        let queryParams = this.commonService.getHttpParamsByJson(params);
        this.userLeadService.getMyLeads(queryParams).subscribe((data: any) => {
            this.appointments = data.data.map((item) => {
                return { ...item, selectedStatus: '' };
            });

            this.totalRecords = data.total;
            this.loading = false;
        });

        console.log('api called');
    }

    goTo(url) {
        this.router.navigateByUrl(url);
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
        } else {
            this.userLeadService
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

    confirm(event: Event) {
        console.log('ss');
        this.confirmationService.confirm({
            target: event.currentTarget || new EventTarget(),
            key: 'confirm1',
            message: 'Please confirm to proceed moving forward.',
            icon: 'pi pi-exclamation-circle',
            acceptIcon: 'pi pi-check mr-1',
            rejectIcon: 'pi pi-times mr-1',
            acceptLabel: 'Confirm',

            rejectLabel: 'Cancel',
            rejectButtonStyleClass: 'p-button-outlined p-button-sm',
            acceptButtonStyleClass: 'p-button-sm',
            accept: () => {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Confirmed',
                    detail: 'You have accepted',
                    life: 3000,
                });
            },
            reject: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Rejected',
                    detail: 'You have rejected',
                    life: 3000,
                });
            },
        });
    }

    confirm2(event: Event, user) {
        this.confirmationService.confirm({
            key: 'confirm2',
            target: event.target || new EventTarget(),
            message: 'Are you sure that you want to proceed?',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.leadsService.delete(user._id).subscribe((res) => {
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
        this.leadsService.getAll(queryParams).subscribe((res) => {
            this.appointments = res;
        });
    }
    async updateStatus(id, status) {
        this.leadsService.update(id, { status }).subscribe((res) => {
            this.messageService.add({
                // key: 'tst',
                severity: 'success',
                summary: 'Success Message',
                detail: 'Status updated successfully',
            });
        });
    }

    openDialog(customer: any, tableEvent) {
        this.ref = this.dialogService.open(FreeTrialFormComponent, {
            data: {
                customer,
            },
            width: '50%',
            header: 'Free Trial Form',
        });

        this.ref.onClose.subscribe((result) => {
            console.log('closed');
            setTimeout(() => {
                this.loadBLogs(tableEvent);
            }, 2000);
        });
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
