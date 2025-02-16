import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
        { name: 'Stock options', key: 'Stock options' },
        { name: 'Index option', key: 'Index option' },
        { name: 'Stock future', key: 'Stock future' },
        { name: 'Stock cash', key: 'Stock cash' },
        { name: 'Crypto', key: 'Crypto' },
        { name: 'Forex', key: 'Forex' },
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
            investment: ['', [Validators.pattern('^[0-9]*$')]],
            remark: [''],
            free_trial_date: ['', Validators.required],
            options: this.fb.array([]), // FormArray to store multiple selections
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

    onCheckboxChange(event: any, categoryName: string) {
        const optionsArray = this.form.get('options') as FormArray;

        if (event.checked) {
            optionsArray.push(this.fb.control(categoryName)); // ✅ Add when checked
        } else {
            const index = optionsArray.controls.findIndex(
                (ctrl) => ctrl.value === categoryName
            );
            if (index !== -1) {
                optionsArray.removeAt(index); // ✅ Remove when unchecked
            }
        }

        console.log('Updated FormArray:', optionsArray.value);
    }

    getSelectedOptions() {
        return (this.form.get('options') as FormArray).value.join(', ');
    }

    cancel() {
        this.ref.close();
    }
    async submit() {
        this.form.markAllAsTouched();
        if (this.form.valid) {
            let data = this.form.value;
            data['free_trial_date'] = new Date(
                Date.UTC(
                    this.free_trial_date.value.getFullYear(),
                    this.free_trial_date.value.getMonth(),
                    this.free_trial_date.value.getDate()
                )
            );
            data['options'] = this.getSelectedOptions();
            console.log(data);
            this.userLeadsService
                .update(this.customer?._id, {
                    status: 'FREE_TRIAL',
                    free_trial: data,
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
