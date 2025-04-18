import { Component } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common/common.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DatePipe } from '@angular/common';
import { FileUploadFormComponent } from 'src/app/appointments/file-upload-form/file-upload-form.component';
import * as FileSaver from 'file-saver';
import { SpotIncentiveService } from 'src/app/services/spot-incentive/spot-incentive.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BranchesService } from 'src/app/services/branches/branches.service';

@Component({
    selector: 'app-spot-incentive-list',
    templateUrl: './spot-incentive-list.component.html',
    styleUrl: './spot-incentive-list.component.scss',
    providers: [MessageService, ConfirmationService, DialogService, DatePipe],
})
export class SpotIncentiveListComponent {
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

    totalRecords = 0;

    roles = [
        { name: 'All', code: '' },
        { name: 'TeamLead', code: 'teamlead' },
        { name: 'Employee', code: 'employee' },
    ];

    ref: DynamicDialogRef | undefined;
    form: FormGroup;

    constructor(
        private spotIncentiveService: SpotIncentiveService,
        private router: Router,
        private authService: AuthService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private api: ApiService,
        private branchService: BranchesService,
        private commonService: CommonService,
        private dialogService: DialogService,
        private datePipe: DatePipe,
        private fb: FormBuilder,
        private toast: MessageService
    ) {
        this.form = this.fb.group({
            spot_incentive_base_business: [
                '',
                [Validators.required, Validators.pattern('^[0-9]*$')], // Allows only numbers
            ],
        });
    }

    ngOnInit() {
        this.role = this.authService.getRole();
        this.branchService.getMyBranchDetails().subscribe({
            next: (res: any) => {
                this.form.patchValue({
                    spot_incentive_base_business:
                        res?.spot_incentive_base_business,
                });
            },
        });
    }

    get spot_incentive_base_business() {
        return this.form.get('spot_incentive_base_business');
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
        this.spotIncentiveService.getAll(queryParams).subscribe((data: any) => {
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
                this.spotIncentiveService.delete(user._id).subscribe((res) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Deleted',
                        detail: 'Spot Incentive Deleted Successfully',
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
                    detail: 'Unable to delete Spot Incentive',
                });
            },
        });
    }

    saveBase() {
        this.form.markAllAsTouched();
        if (this.form.valid) {
            this.branchService.updateBase(this.form.value).subscribe({
                next: (res) => {
                    this.toast.add({
                        key: 'tst',
                        severity: 'success',
                        summary: 'Success Message',
                        detail: 'Spot Incentive bases saved successfully',
                    });
                },
            });
        }
    }

    filter(ev) {
        this.loadBLogs(ev);
    }
    async updateStatus(id, status) {
        this.spotIncentiveService.update(id, { status }).subscribe((res) => {
            this.messageService.add({
                // key: 'tst',
                severity: 'success',
                summary: 'Success Message',
                detail: 'Status updated successfully',
            });
        });
    }

    openDialog(id: string) {
        this.ref = this.dialogService.open(FileUploadFormComponent, {
            data: {
                id,
            },
            header: 'File Upload',
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
