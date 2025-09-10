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
import { MonthlyIncentiveService } from 'src/app/services/monthly-incentive/monthly-incentive.service';

@Component({
    selector: 'app-monthly-incentive-list',
    templateUrl: './monthly-incentive-list.component.html',
    styleUrl: './monthly-incentive-list.component.scss',
    providers: [MessageService, ConfirmationService, DialogService, DatePipe],
})
export class MonthlyIncentiveListComponent {
    display = false;
    selectedRole = '';
    selectedDate = '';
    searchText = '';

    isExpanded: boolean = false;

    idFrozen: boolean = false;

    loading: boolean = false;

    appointments: any = [];

    role = '';

    doctors = [];

    minDate;

    roles = [
        { name: 'All', code: '' },
        { name: 'TeamLead', code: 'teamlead' },
        { name: 'Employee', code: 'employee' },
    ];
    totalRecords = 0;

    ref: DynamicDialogRef | undefined;

    constructor(
        private monthlyIncentiveService: MonthlyIncentiveService,
        private router: Router,
        private authService: AuthService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private api: ApiService,
        private commonService: CommonService,
        private dialogService: DialogService,
        private datePipe: DatePipe
    ) {}

    ngOnInit() {
        this.role = this.authService.getRole();
    }

    loadBLogs(event: any) {
        this.loading = true;

        const page = event.first / event.rows;
        const size = event.rows;

        let params = {};

        if (this.searchText != '') {
            params['q'] = this.searchText;
        }

        if (this.selectedRole != '') {
            params['role'] = this.selectedRole;
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
        this.monthlyIncentiveService
            .getAll(queryParams)
            .subscribe((data: any) => {
                this.appointments = data.data;
                this.totalRecords = data.total;
                this.loading = false;
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
                this.monthlyIncentiveService
                    .delete(user._id)
                    .subscribe((res) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Deleted',
                            detail: 'Monthly Incentive Deleted Successfully',
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
                    detail: 'Unable to delete Monthly Incentive',
                });
            },
        });
    }

    filter(ev) {
        this.loadBLogs(ev);
    }
    async updateStatus(id, status) {
        this.monthlyIncentiveService.update(id, { status }).subscribe((res) => {
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
