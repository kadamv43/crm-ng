import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { InvoicesService } from 'src/app/services/invoices/invoices.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PendingInvoiceComponent } from './pending-invoice/pending-invoice.component';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { CommonService } from 'src/app/services/common/common.service';
import { BanksService } from 'src/app/services/banks/banks.service';
import { BranchesService } from 'src/app/services/branches/branches.service';
import { UsersService } from 'src/app/services/users/users.service';

interface TargetData {
    achieved: number;
    pending: number;
    total: number;
}

interface PaymentData {
    total_payment_done: number;
    expected_payment: number;
}

interface CommonApiResponse {
    total: number;
    data: [];
}

@Component({
    templateUrl: './dashboard.component.html',
    providers: [DialogService],
})
export class DashboardComponent implements OnInit {
    items!: MenuItem[];

    options: any;
    chartData: any;
    targetData: TargetData = {
        total: 0,
        achieved: 0,
        pending: 0,
    };
    paymentData: PaymentData = {
        total_payment_done: 0,
        expected_payment: 0,
    };
    data;
    admins = [];
    free_trial: CommonApiResponse = {
        total: 0,
        data: [],
    };

    payments_done: CommonApiResponse = {
        total: 0,
        data: [],
    };
    appointments: any;
    totalRecords = 0;
    loading = false;
    pendingInvoiceCount = 0;
    pendingInvoices = [];
    ref: DynamicDialogRef | undefined;
    chartOptions: any;
    role = '';
    showAdmin = false;
    companies = [];
    tlList = [];
    employees = [];
    selectedCompany = '';
    selectedAdmin = '';
    selectedTL = '';
    loggedInUserBranch;
    showTlList = false;
    selectedEmployee = '';
    subscription!: Subscription;

    constructor(
        public layoutService: LayoutService,
        private invoiceService: InvoicesService,
        private userService: UsersService,
        private commonService: CommonService,
        private branchService: BranchesService,
        private banksService: BanksService,
        private dashboardService: DashboardService,
        public dialogService: DialogService
    ) {}

    ngOnInit() {
        this.role = localStorage.getItem('role');
        const branchData = localStorage.getItem('branch');
        this.loggedInUserBranch = branchData ? JSON.parse(branchData) : null;

        this.getTargetData();

        this.getCompanies();
        // this.getAdmins();
        this.getFreeTrialData();
        this.getPaymementData();

        if (this.role == 'admin') {
            this.getTlList();
            this.getFreeTrialData();
            this.getPaymentsDoneData();
        }
    }

    onChangeCompany(event) {
        this.selectedCompany = event.value;
        this.showAdmin = true;
        this.getAdmins(event.value);
    }

    onChangeFilter(event) {
        this.selectedEmployee = event.value;
        this.getDashBoard();
    }

    getDashBoard() {
        let userId = this.selectedEmployee;
        this.getTargetDataByUserId(userId);
        this.getFreeTrialDataByUserId(userId);
        this.getPaymentDoneDataByUserId(userId);
        this.getIncenticeList();
        this.getCurrentMonthPaidList();
    }

    getTargetDataByUserId(userId) {}
    getFreeTrialDataByUserId(userId) {}
    getPaymentDoneDataByUserId(userId) {}
    getCurrentMonthPaidList() {}
    getIncenticeList() {}
    onChangeAdmin(event) {
        // this.selectedAdmin = event.value;
        this.showTlList = true;
        this.getTlList();
    }

    onChangeTL(event) {
        // this.selectedAdmin = event.value;
        this.showTlList = true;
        this.getEmployees(this.selectedCompany, event.value);
    }

    getFreeTrialData() {
        let params = {
            page: 0,
            size: 100,
        };
        if (this.loggedInUserBranch) {
            params['branch'] = this.loggedInUserBranch?._id;
        }
        if (this.selectedEmployee) {
            params['user'] = this.selectedEmployee;
        }
        this.dashboardService.getFreeTrial(params).subscribe((res: any) => {
            this.free_trial = res;
        });
    }

    getPaymentsDoneData() {
        let params = {
            page: 0,
            size: 100,
        };
        if (this.loggedInUserBranch) {
            params['branch'] = this.loggedInUserBranch?._id;
        }
        if (this.selectedEmployee) {
            params['user'] = this.selectedEmployee;
        }
        this.dashboardService.getPaymentDone(params).subscribe((res: any) => {
            this.payments_done = res;
        });
    }

    getTargetData() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');

        this.options = {
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        color: textColor,
                    },
                },
            },
        };

        let params = {
            page: 0,
            size: 100,
        };
        if (this.loggedInUserBranch) {
            params['branch'] = this.loggedInUserBranch?._id;
        }
        if (this.selectedEmployee) {
            params['user'] = this.selectedEmployee;
        } else {
            params['user'] = localStorage.getItem('userId');
        }
        this.dashboardService.getTarget(params).subscribe((res: any) => {
            // this.payments_done = res;
            this.targetData = res;
            this.data = {
                labels: ['Total', 'Achieved', 'Pending'],
                datasets: [
                    {
                        data: [
                            Number(this.targetData?.total) || 0, // Ensure it's a number
                            Number(this.targetData?.achieved) || 0, // Ensure it's a number
                            Number(this.targetData?.pending) || 0, // Ensure it's a number
                        ],
                        backgroundColor: [
                            documentStyle.getPropertyValue('--blue-500'),
                            documentStyle.getPropertyValue('--green-500'),
                            documentStyle.getPropertyValue('--red-500'),
                        ],
                        hoverBackgroundColor: [
                            documentStyle.getPropertyValue('--blue-400'),
                            documentStyle.getPropertyValue('--yellow-400'),
                            documentStyle.getPropertyValue('--green-400'),
                        ],
                    },
                ],
            };
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
        }

        this.userService.getAll(params).subscribe({
            next: (res: any) => {
                this.tlList = res.data.map((item) => {
                    return { name: item?.username, code: item?._id };
                });
            },
        });
    }

    getPaymementData() {
        this.dashboardService
            .getPaymentDetails()
            .subscribe((res: PaymentData) => {
                this.paymentData = res;
            });
    }

    loadBLogs(event: any) {
        // this.loading = true;

        const page = event.first / event.rows;
        const size = event.rows;

        let params = {};

        params['page'] = page;
        params['size'] = size;

        let queryParams = this.commonService.getHttpParamsByJson(params);
        this.banksService.getAll(queryParams).subscribe((data: any) => {
            this.appointments = data.data;
            this.totalRecords = data.total;
            this.loading = false;
        });
    }
    openModal() {
        this.ref = this.dialogService.open(PendingInvoiceComponent, {
            header: 'Pending Balance',
            width: '70%',
            contentStyle: { overflow: 'auto' },
            baseZIndex: 10000,
            maximizable: true,
            data: {
                data: this.pendingInvoices,
            },
        });
    }
}
