import { Component, OnInit } from '@angular/core';
import { Customer, Representative } from 'src/app/demo/api/customer';
import { Product } from 'src/app/demo/api/product';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AppointmentService } from 'src/app/services/appointment/appointment.service';
import { AuthService } from 'src/app/services/auth.service';
import * as FileSaver from 'file-saver';
import { CommonService } from 'src/app/services/common/common.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileUploadFormComponent } from '../file-upload-form/file-upload-form.component';
import { DatePipe } from '@angular/common';
import {
    debounceTime,
    distinctUntilChanged,
    first,
    last,
    map,
    Subject,
} from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { dA } from '@fullcalendar/core/internal-common';

@Component({
    selector: 'app-appointment-list',
    templateUrl: './appointment-list.component.html',
    styleUrl: './appointment-list.component.scss',
    providers: [ConfirmationService, MessageService, DialogService, DatePipe],
})
export class AppointmentListComponent implements OnInit {
    private searchSubject: Subject<string> = new Subject();

    statusList = [
        { name: 'Select Status', code: null },
        { name: 'Created', code: 'Created' },
        { name: 'Ongoing', code: 'Ongoing' },
        { name: 'Completed', code: 'Completed' },
        { name: 'Cancelled', code: 'Cancelled' },
    ];

    display = false;
    selectedStatus = '';
    selectedDate = [];
    searchText = '';
    customers1: Customer[] = [];

    customers2: Customer[] = [];

    customers3: Customer[] = [];

    selectedCustomers1: Customer[] = [];

    selectedCustomer: Customer = {};

    representatives: Representative[] = [];

    statuses: any[] = [];

    products: Product[] = [];

    rowGroupMetadata: any;

    activityValues: number[] = [0, 100];

    isExpanded: boolean = false;

    idFrozen: boolean = false;

    loading: boolean = false;

    appointments: any = [];

    role = '';

    minDate;

    totalRecords = 0;

    ref: DynamicDialogRef | undefined;

    queryParams = {};

    constructor(
        private appointmentService: AppointmentService,
        private authService: AuthService,
        private commonService: CommonService,
        private dialogService: DialogService,
        private datePipe: DatePipe,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.searchSubject
            .pipe(debounceTime(400), distinctUntilChanged())
            .subscribe((value) => {
                this.searchText = value;
                this.queryParams['search'] = this.searchText;
                console.log(this.queryParams);
                let data = { first: 0, rows: 10 };
                this.loadAppointments(data);
            });
    }

    searchApi(value: string) {
        console.log('api', value);
    }

    onStatusChange(value: string) {
        this.selectedStatus = value;
        this.queryParams['status'] = value;
        console.log(this.queryParams);
        let data = { first: 0, rows: 10 };
        this.loadAppointments(data);
    }

    onDateChange(value: any) {
        this.selectedDate = value;
        console.log(this.selectedDate);
        if (this.selectedDate[0]) {
            this.queryParams['from'] = this.datePipe.transform(
                this.selectedDate[0],
                'yyyy-MM-dd'
            );
        }

        if (this.selectedDate[1]) {
            this.queryParams['to'] = this.datePipe.transform(
                this.selectedDate[1],
                'yyyy-MM-dd'
            );
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
            this.queryParams['from'] = this.datePipe.transform(
                this.selectedDate[0],
                'yyyy-MM-dd'
            );
        }

        if (this.selectedDate[1]) {
            this.queryParams['to'] = this.datePipe.transform(
                this.selectedDate[1],
                'yyyy-MM-dd'
            );
        }
    }

    ngOnInit() {
        this.route.queryParams.subscribe((data) => {
            this.selectTodaysDate();
            this.searchText = data['search'] ?? '';
            this.selectedStatus = data['status'] ?? '';
            if (data['from']) {
                this.selectedDate[0] = new Date(data['from']);
            }
            if (data['from'] && !data['to']) {
                this.selectedDate[1] = null
            }
            this.queryParams = { ...data };
        });
        ;
        this.role = this.authService.getRole();
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
            console.log(this.selectedDate);
            params['from'] = this.datePipe.transform(
                this.selectedDate[0],
                'yyyy-MM-dd'
            );
        }

        if (this.selectedDate && this.selectedDate[1]) {
            params['to'] = this.datePipe.transform(
                this.selectedDate[1],
                'yyyy-MM-dd'
            );
        }

        params['page'] = page;
        params['size'] = size;

        let queryParams = this.commonService.getHttpParamsByJson(params);
        this.appointmentService.getAll(queryParams).subscribe((data: any) => {
            this.appointments = data.data;
            this.totalRecords = data.total;
            this.loading = false;
        });
    }

    onSearchName(value: any) {
        console.log(value);
        this.searchSubject.next(value); // Push the value into the subject
    }

    async clear(event) {
        this.router.navigate(['/appointments']);
    }

    openDialog(id: string) {
        this.ref = this.dialogService.open(FileUploadFormComponent, {
            data: {
                id,
                fileNameInput: false,
                fileTypes: '.png,.jpg,.jpeg,.JPEG,.pdf',
                fileUploadUrl: 'appointments/upload-files/' + id,
            },
            header: 'File Upload',
        });
    }

    exportExcel() {
        const doctors = this.appointments.map((item) => {
            return {
                appointment_number: item.appointment_number,
                first_name: item.patient.first_name,
                last_name: item.patient.last_name,
                mobile: item.patient.mobile,
                status: item.status,
                email: item.patient.email,
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
            this.saveAsExcelFile(excelBuffer, 'appointments');
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
