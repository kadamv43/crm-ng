import { Component } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthService } from 'src/app/services/auth.service';
import { CommonService } from 'src/app/services/common/common.service';
import { UserLeadsService } from 'src/app/services/user-leads/user-leads.service';

@Component({
    selector: 'app-mobile-history',
    templateUrl: './mobile-history.component.html',
    styleUrl: './mobile-history.component.scss',
})
export class MobileHistoryComponent {
    customer: any;
    minDate;

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

    totalRecords = 0;

    users: any = [];

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,
        public commonService: CommonService,
        public userLeadService: UserLeadsService,
        public authService: AuthService
    ) {
        this.customer = config.data.leads;
        console.log(this.customer);
    }

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

        let queryParams = this.commonService.getHttpParamsByJson(params);
        this.userLeadService.getAll(queryParams).subscribe((res) => {
            this.appointments = res;
        });
    }
}
