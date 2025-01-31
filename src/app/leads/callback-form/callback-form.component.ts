import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UserLeadsService } from 'src/app/services/user-leads/user-leads.service';

@Component({
    selector: 'app-callback-form',
    templateUrl: './callback-form.component.html',
    styleUrl: './callback-form.component.scss',
})
export class CallbackFormComponent {
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
        this.form = this.fb.group({
            mobile: [this.customer.mobile, Validators.required],
            name: [this.customer.name],
            city: [this.customer.city],
            callback_date: ['', Validators.required],
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

    get callback_date() {
        return this.form.get('callback_date');
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
                    status: 'CALLBACK',
                    callback: this.form.value,
                })
                .subscribe((res) => {
                    this.toast.add({
                        key: 'tst',
                        severity: 'success',
                        summary: 'Success Message',
                        detail: 'CALLBACK created successfully',
                    });

                    this.ref.close();
                });
        }
    }
}
