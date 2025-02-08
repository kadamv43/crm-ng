import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { dA } from '@fullcalendar/core/internal-common';
import { options } from '@fullcalendar/core/preact';
import { MessageService } from 'primeng/api';
import {
    DialogService,
    DynamicDialogConfig,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { BranchesService } from 'src/app/services/branches/branches.service';
import { UserLeadsService } from 'src/app/services/user-leads/user-leads.service';

@Component({
    selector: 'app-free-trial-form',
    templateUrl: './free-trial-form.component.html',
    styleUrl: './free-trial-form.component.scss',
})
export class FreeTrialFormComponent {
    form: FormGroup;
    customer: any;
    minDate;

    selectedCategories: any[] = [];

    categories: any[] = [
        { name: 'Metal', key: 'A' },
        { name: 'Equity', key: 'M' },
    ];

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
            mobile: [this.customer.mobile, Validators.required],
            name: [this.customer.name],
            city: [this.customer.city],
            investment: [''],
            remark: [''],
            free_trial_date: ['', Validators.required],
            options: [],
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

    get investment() {
        return this.form.get('investment');
    }
    get remark() {
        return this.form.get('remark');
    }

    get free_trial_date() {
        return this.form.get('free_trial_date');
    }

    cancel() {
        this.ref.close();
    }
    async submit() {
        this.form.markAllAsTouched();
        if (this.form.valid) {
            console.log(this.form.value);
            this.userLeadsService
                .update(this.customer?._id, {
                    status: 'FREE_TRIAL',
                    free_trial: this.form.value,
                })
                .subscribe((res) => {
                    this.toast.add({
                        key: 'tst',
                        severity: 'success',
                        summary: 'Success Message',
                        detail: 'Free trial created successfully',
                    });

                    this.ref.close();
                });
        }
    }
}
