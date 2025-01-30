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

@Component({
    selector: 'app-my-leads',
    templateUrl: './my-leads.component.html',
    styleUrl: './my-leads.component.scss',
    providers: [MessageService, ConfirmationService, DialogService, DatePipe],
})
export class MyLeadsComponent {
    statusList = [
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
    selectedStatus = '';
    selectedDate = '';
    selectedUser = '';
    searchText = '';
    selectedProducts: any[] = [];

    isExpanded: boolean = false;

    idFrozen: boolean = false;

    loading: boolean = false;

    appointments: any = [];

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
            this.appointments = data.data;
            this.totalRecords = data.total;
            this.loading = false;
        });

        console.log('api called');
    }

    goTo(url) {
        this.router.navigateByUrl(url);
    }

    onStatusChange(customer, event, tableEvent) {
        let value = event?.value;

        if (value == 'FREE_TRIAL') {
            this.openDialog(customer, tableEvent);
        } else {
            this.userLeadService
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
            header: 'File Upload',
        });

        this.ref.onClose.subscribe((result) => {
            console.log('closed');
            setTimeout(() => {
                this.loadBLogs(tableEvent);
            }, 2000);
        });
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
