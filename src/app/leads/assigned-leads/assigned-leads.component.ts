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
import { UsersService } from 'src/app/services/users/users.service';
import { UserHotLeadsService } from 'src/app/services/user-hot-leads/user-hot-leads.service';
import { UserLeadsService } from 'src/app/services/user-leads/user-leads.service';

@Component({
    selector: 'app-assigned-leads',
    templateUrl: './assigned-leads.component.html',
    styleUrl: './assigned-leads.component.scss',
    providers: [MessageService, ConfirmationService, DialogService, DatePipe],
})
export class AssignedLeadsComponent {
    users: any = [];

    bloodGroups = [
        { name: 'Rahul', code: 'Rahul' },
        { name: 'Sham', code: 'Sham' },
    ];
    display = false;
    selectedStatus = '';
    selectedDate = '';
    searchText = '';
    selectedProducts: any[] = [];

    isExpanded: boolean = false;

    idFrozen: boolean = false;

    loading: boolean = false;

    appointments: any = [];

    selectedUser = '';

    role = '';

    doctors = [];

    minDate;

    totalRecords = 0;

    ref: DynamicDialogRef | undefined;

    constructor(
        private hotLeadsService: HotLeadsService,
        private userHotLeadsService: UserHotLeadsService,
        private userLeadService: UserLeadsService,
        private router: Router,
        private authService: AuthService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private api: ApiService,
        private toast: MessageService,
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

        let queryParams = this.commonService.getHttpParamsByJson(params);
        this.userLeadService
            .getAssignedLeads(queryParams)
            .subscribe((data: any) => {
                this.appointments = data.data;
                this.totalRecords = data.total;
                this.loading = false;
            });
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
                this.hotLeadsService.delete(user._id).subscribe((res) => {
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

    deleteLeads(tableEvent) {
        this.userLeadService
            .deleteBulk({
                user: this.selectedUser,
                leads: this.selectedProducts,
            })
            .subscribe({
                next: (res) => {
                    this.toast.add({
                        key: 'tst',
                        severity: 'success',
                        summary: 'Success Message',
                        detail: 'Leads Deleted Successfully',
                    });

                    this.loadBLogs(tableEvent);
                },
            });
    }

    assignLeads(event) {
        this.userLeadService
            .createBulk({
                user: this.selectedUser,
                leads: this.selectedProducts,
            })
            .subscribe({
                next: (res) => {
                    this.toast.add({
                        key: 'tst',
                        severity: 'success',
                        summary: 'Success Message',
                        detail: 'Leads Assigned Successfully',
                    });

                    this.loadBLogs(event);
                },
            });
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
        this.hotLeadsService.getAll(queryParams).subscribe((res) => {
            this.appointments = res;
        });
    }
    async updateStatus(id, status) {
        this.hotLeadsService.update(id, { status }).subscribe((res) => {
            this.messageService.add({
                // key: 'tst',
                severity: 'success',
                summary: 'Success Message',
                detail: 'Status updated successfully',
            });
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
