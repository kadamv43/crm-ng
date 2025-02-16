import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { options } from '@fullcalendar/core/preact';
import { run } from 'node:test';
import { MessageService } from 'primeng/api';
import {
    DialogService,
    DynamicDialogConfig,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { BanksService } from 'src/app/services/banks/banks.service';
import { PaymentLinksService } from 'src/app/services/payment-links/payment-links.service';
import { UpiService } from 'src/app/services/upi/upi.service';
import { UserLeadsService } from 'src/app/services/user-leads/user-leads.service';

@Component({
    selector: 'app-payment-form',
    templateUrl: './payment-form.component.html',
    styleUrl: './payment-form.component.scss',
})
export class PaymentFormComponent {
    form: FormGroup;
    customer: any;
    minDate;
    showPaymentOptions = false;

    payment_modes = [
        { name: 'UPI', code: 'UPI' },
        { name: 'BANK', code: 'BANK' },
        { name: 'LINK', code: 'LINK' },
    ];

    payment_options = [];

    constructor(
        private userLeadsService: UserLeadsService,
        private toast: MessageService,
        private router: Router,
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,
        public upiSerice: UpiService,
        public paymentLinksService: PaymentLinksService,
        public bankService: BanksService
    ) {
        this.customer = config.data.customer;
        console.log(this.customer);

        this.form = this.fb.group({
            name: [this.customer.free_trial?.name],
            mobile: [this.customer.free_trial?.mobile],
            city: [this.customer.free_trial?.city],
            payment_amount: [
                '',
                [Validators.required, Validators.pattern('^[0-9]*$')],
            ],
            payment_mode: ['', Validators.required],
            payment_details: ['', Validators.required],
            payment_date: ['', Validators.required],
        });
    }
    ngOnInit(): void {
        this.minDate = new Date();
    }

    get name() {
        return this.form.get('name');
    }

    get mobile() {
        return this.form.get('mobile');
    }

    get city() {
        return this.form.get('city');
    }

    get payment_amount() {
        return this.form.get('payment_amount');
    }

    get payment_mode() {
        return this.form.get('payment_mode');
    }

    get payment_date() {
        return this.form.get('payment_date');
    }

    get payment_details() {
        return this.form.get('payment_details');
    }

    onPaymentModeChange(event) {
        this.showPaymentOptions = true;
        let value = event?.value;

        if (value == 'UPI') {
            this.getUpiList();
        } else if (value == 'BANK') {
            this.getBankList();
        } else {
            this.getPaymentLinkList();
        }
    }

    getUpiList() {
        let params = {};
        params['page'] = 0;
        params['size'] = 50;
        this.upiSerice.getAll(params).subscribe({
            next: (res: any) => {
                this.payment_options = res?.data.map((item: any) => {
                    return {
                        name: item?.upi_id + ' ' + item.upi_number,
                        code: item,
                    };
                });
            },
        });
    }

    getBankList() {
        let params = {};
        params['page'] = 0;
        params['size'] = 50;
        this.bankService.getAll(params).subscribe({
            next: (res: any) => {
                this.payment_options = res?.data.map((item: any) => {
                    return {
                        name:
                            item?.account_holder +
                            ' ' +
                            item.bank_name +
                            ' ' +
                            item.account_number,
                        code: item,
                    };
                });
            },
        });
    }

    getPaymentLinkList() {
        let params = {};
        params['page'] = 0;
        params['size'] = 50;
        this.paymentLinksService.getAll(params).subscribe({
            next: (res: any) => {
                this.payment_options = res?.data.map((item: any) => {
                    return {
                        name: item?.name + ' ' + item.link,
                        code: item,
                    };
                });
            },
        });
    }

    cancel() {
        this.ref.close();
    }
    async submit() {
        // let data = this.form.value;
        this.form.markAllAsTouched();
        if (this.form.valid) {
            console.log(this.form.value);
            this.userLeadsService
                .update(this.customer?._id, {
                    status: 'PAYMENT_DONE',
                    payment: this.form.value,
                })
                .subscribe((res) => {
                    this.toast.add({
                        key: 'tst',
                        severity: 'success',
                        summary: 'Success Message',
                        detail: 'Payment done successfully',
                    });

                    this.ref.close();
                });
        }
    }
}
