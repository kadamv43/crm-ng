import { Component, OnInit } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PendingInvoiceComponent } from './pending-invoice/pending-invoice.component';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { CommonService } from 'src/app/services/common/common.service';
import { BanksService } from 'src/app/services/banks/banks.service';
import { BranchesService } from 'src/app/services/branches/branches.service';
import { UsersService } from 'src/app/services/users/users.service';
import { UserLeadsService } from 'src/app/services/user-leads/user-leads.service';
import { PaymentFormComponent } from 'src/app/leads/payment-form/payment-form.component';

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
    totalAmount?: 0;
}

@Component({
    templateUrl: './dashboard.component.html',
    providers: [DialogService, MessageService],
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

    payments_done;
    todays_payments_done: CommonApiResponse = {
        total: 0,
        data: [],
    };
    expected_payment: CommonApiResponse = {
        total: 0,
        data: [],
    };
    appointments: any;
    totalRecords = 0;
    currentMonthPaidtotalRecords = 0;
    totalFreeTrialRecords = 0;
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
    smartView;
    smartViewRecords = 0;
    tableEvent;
    isEditing = false;
    selectedOption: string = '';
    EmailOptions = [
        { label: 'Not Done', value: 'Not Done' },
        { label: 'Email Sent', value: 'Email Sent' },
        { label: 'Email Received', value: 'Email Received' },
        { label: 'Call Recording', value: 'Call Recording' },
    ];

    constructor(
        public layoutService: LayoutService,
        private userLeadService: UserLeadsService,
        private userService: UsersService,
        private commonService: CommonService,
        private branchService: BranchesService,
        private banksService: BanksService,
        private dashboardService: DashboardService,
        public dialogService: DialogService,
        private toast: MessageService
    ) {}

    ngOnInit() {
        this.role = localStorage.getItem('role');
        const branchData = localStorage.getItem('branch');
        try {
            this.loggedInUserBranch = branchData
                ? JSON.parse(branchData)
                : null;
        } catch (error) {
            // console.error('Error parsing branchData:', error);
            this.loggedInUserBranch = null;
        }

        if (this.role == 'superadmin') {
            this.getCompanies();
        } else {
            this.getDashBoard();
            this.getTlList();
        }

        if (this.role == 'teamlead') {
            this.getEmployeesByTL();
        }
    }

    onChangeCompany(event) {
        this.selectedCompany = event.value;
        this.getTlList();
        this.getDashBoard();
    }

    onChangeFilter(event) {
        this.selectedEmployee = event.value;
        this.getDashBoard();
    }

    getDashBoard() {
        let event = {};
        event['first'] = 0;
        event['rows'] = 50;
        this.getSmartView(event);
        this.getTargetData();
        this.getFreeTrialData(event);
        this.getTodaysPaymentDone();
        this.getTodaysExpectedPayment();
        this.getCurrentMonthPaymentDone(event);
    }

    onChangeAdmin(event) {
        this.selectedEmployee = event.value;
        this.showTlList = true;
        this.getTlList();
        this.getDashBoard();
    }

    onChangeTL(event) {
        // this.selectedAdmin = event.value;
        this.showTlList = true;
        this.selectedEmployee = event?.value;
        this.getDashBoard();
        this.getEmployees(this.selectedCompany, event.value);
    }

    getFreeTrialData(event) {
        const page = event.first / event.rows;
        const size = event.rows;

        let params = {};

        params['page'] = page;
        params['size'] = size;

        if (this.loggedInUserBranch) {
            params['branch'] = this.loggedInUserBranch?._id;
        }
        if (this.selectedEmployee) {
            params['user'] = this.selectedEmployee;
        } else {
            params['user'] = localStorage.getItem('userId');
        }

        this.dashboardService.getFreeTrial(params).subscribe((res: any) => {
            this.free_trial = res;
            this.totalFreeTrialRecords = res.total;
        });
    }

    editPayment(customer: any, te: any) {
        this.ref = this.dialogService.open(PaymentFormComponent, {
            data: {
                customer,
                invest_more: false,
            },
            width: '50%',
            header: 'Payment Form',
        });

        this.tableEvent = te;
        this.ref.onClose.subscribe((result: any) => {
            this.refresh(this.tableEvent);
        });
    }

    refresh(event) {
        this.loading = true;
        console.log(event);
        this.getCurrentMonthPaymentDone(event);
    }

    getTodaysPaymentDone() {
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
        if (this.role == 'employee') {
            params['user'] = localStorage.getItem('userId');
        }
        this.dashboardService
            .getTodaysPaymentDone(params)
            .subscribe((res: any) => {
                this.todays_payments_done = res;
            });
    }

    getSmartView(event) {
        const page = event.first / event.rows;
        const size = event.rows;

        let params = {};

        params['page'] = page;
        params['size'] = size;

        if (this.loggedInUserBranch) {
            params['branch'] = this.loggedInUserBranch?._id;
        } else {
            params['branch'] = this.selectedCompany;
        }
        if (this.selectedEmployee) {
            params['user'] = this.selectedEmployee;
        } else {
            params['user'] = localStorage.getItem('userId');
        }

        this.dashboardService.getSmartView(params).subscribe((res: any) => {
            this.smartView = res.result;
            this.smartViewRecords = res.total;
        });
    }

    onOptionSelect(customer) {
        this.isEditing = false;
        console.log(customer);
        this.userLeadService
            .update(customer?._id, {
                // status: 'EXPECTED_PAYMENT',
                payment: { email_status: customer?.email_status },
            })
            .subscribe((res) => {
                this.toast.add({
                    key: 'tst',
                    severity: 'success',
                    summary: 'Success Message',
                    detail: 'Payment Email Status Updated ',
                });

                this.ref.close();
            });
    }

    investMore(customer: any, event) {
        console.log(customer);
        this.ref = this.dialogService.open(PaymentFormComponent, {
            data: {
                customer,
                invest_more: true,
            },
            width: '50%',
            header: 'Payment Form',
        });

        this.ref.onClose.subscribe((result) => {
            console.log('closed');
            this.getCurrentMonthPaymentDone(event);
        });
    }

    getCurrentMonthPaymentDone(event) {
        const page = event.first / event.rows;
        const size = event.rows;

        let params = {};

        params['page'] = page;
        params['size'] = size;

        if (this.loggedInUserBranch) {
            params['branch'] = this.loggedInUserBranch?._id;
        } else {
            params['branch'] = this.selectedCompany;
        }
        if (this.selectedEmployee) {
            params['user'] = this.selectedEmployee;
        } else {
            params['user'] = localStorage.getItem('userId');
        }
        this.dashboardService
            .getCurrentMonthPaymentDone(params)
            .subscribe((res: any) => {
                this.payments_done = res;
                this.currentMonthPaidtotalRecords = res.total;
            });
    }

    updateEmailStatus(customer) {
        console.log(customer);
    }

    getTodaysExpectedPayment() {
        let params = {
            page: 0,
            size: 100,
        };
        if (this.loggedInUserBranch) {
            params['branch'] = this.loggedInUserBranch?._id;
        } else {
            params['branch'] = this.selectedCompany;
        }
        if (this.selectedEmployee) {
            params['user'] = this.selectedEmployee;
        } else if (this.role == 'employee' || this.role == 'teamlead') {
            params['user'] = localStorage.getItem('userId');
        }
        this.dashboardService
            .getTodaysExpectedPayment(params)
            .subscribe((res: any) => {
                this.expected_payment = res;
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
        } else {
            params['branch'] = this.selectedCompany;
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

                if (this.role === 'superadmin' && this.companies?.length > 0) {
                    this.selectedCompany = this.companies[0].code; // Set first option by default
                    this.getDashBoard();
                    this.getTlList();
                }
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
        } else {
            params['branch'] = this.selectedCompany;
        }

        this.userService.getAll(params).subscribe({
            next: (res: any) => {
                this.tlList = res.data.map((item) => {
                    return { name: item?.username, code: item?._id };
                });
            },
        });
    }

    getEmployeesByTL() {
        let params = {
            teamlead: localStorage.getItem('userId'),
            role: 'employee',
        };

        let queryParams = this.commonService.getHttpParamsByJson(params);

        this.userService.searchBy(queryParams).subscribe({
            next: (res: any) => {
                this.employees = res.map((item) => {
                    return { name: item?.username, code: item?._id };
                });
            },
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
