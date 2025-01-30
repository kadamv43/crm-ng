import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { options } from '@fullcalendar/core/preact';
import { MessageService } from 'primeng/api';
import {
    DialogService,
    DynamicDialogConfig,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { UserLeadsService } from 'src/app/services/user-leads/user-leads.service';

@Component({
    selector: 'app-expected-payment-form',
    templateUrl: './expected-payment-form.component.html',
    styleUrl: './expected-payment-form.component.scss',
})
export class ExpectedPaymentFormComponent {
    form: FormGroup;
    customer: any;
    minDate;

    constructor(
        private userLeadsService: UserLeadsService,
        private toast: MessageService,
        private router: Router,
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef
    ) {
        this.customer = config.data.customer;
        console.log(this.customer);

        this.form = this.fb.group({
            expected_payment: ['', Validators.required],
            expected_payment_date: ['', Validators.required],
        });
    }
    ngOnInit(): void {
        this.minDate = new Date();
    }

    get expected_payment() {
        return this.form.get('expected_payment');
    }

    get expected_payment_date() {
        return this.form.get('expected_payment_date');
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
                    status: 'EXPECTED_PAYMENT',
                    follow_up: this.form.value,
                })
                .subscribe((res) => {
                    this.toast.add({
                        key: 'tst',
                        severity: 'success',
                        summary: 'Success Message',
                        detail: 'Expected Payment created successfully',
                    });

                    this.ref.close();
                });
        }
    }
}
