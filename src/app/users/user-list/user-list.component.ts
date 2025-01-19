import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ApiService } from 'src/app/services/api.service';
import * as FileSaver from 'file-saver';
import { CommonService } from 'src/app/services/common/common.service';
import { UsersService } from 'src/app/services/users/users.service';

@Component({
    selector: 'app-user-list',
    templateUrl: './user-list.component.html',
    styleUrl: './user-list.component.scss',
    providers: [ConfirmationService, MessageService],
})
export class UserListComponent {
    totalRecords = 0;
    users: any = [];
    searchText = '';

    constructor(
        private router: Router,
        private userService: UsersService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private commonService: CommonService
    ) {}

    loadUsers(event: any) {
        const page = event.first / event.rows;
        const size = event.rows;

        let params = {};
        if (this.searchText != '') {
            params['q'] = this.searchText;
        }

        params['page'] = page;
        params['size'] = size;
        // params['role'] = 'teamlead';

        let queryParams = this.commonService.getHttpParamsByJson(params);

        this.userService.getAll(queryParams).subscribe((data: any) => {
            this.users = data.data;
            this.totalRecords = data.total;
        });
    }

    search(table, event) {
        this.searchText = event.target.value;
        this.loadUsers(table);
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
                this.userService.delete(user._id).subscribe((res) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Deleted',
                        detail: 'Employee Deleted Successfully',
                    });
                    let removedItemIndex = this.users.findIndex(
                        (item) => item._id == user._id
                    );
                    this.users.splice(removedItemIndex, 1);
                });
            },
            reject: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Rejected',
                    detail: 'Unable to delete user',
                });
            },
        });
    }

    exportExcel() {
        const doctors = this.users.map((item) => {
            return {
                first_name: item.first_name,
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
