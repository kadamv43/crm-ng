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
            mobile: [
                {
                    value:
                        this.customer?.mobile ??
                        this.customer?.free_trial?.mobile,
                    disabled: true,
                },
                Validators.required,
            ],

            name: [this.customer?.name ?? this.customer?.free_trial?.name],
            city: [this.customer?.free_trial?.city],
            investment: [
                this.customer?.free_trial?.investment,
                [Validators.pattern('^[0-9]*$')],
            ],
            remark: [this.customer?.free_trial?.remark],
            free_trial_date: [
                this.customer?.free_trial?.free_trial_date
                    ? new Date(this.customer?.free_trial?.free_trial_date) // Convert string to Date
                    : null,
                Validators.required,
            ],
            options: this.fb.array([]), // FormArray to store multiple selections
        });
    }
    ngOnInit(): void {
        this.minDate = new Date();
        this.setSelectedOptions();
    }

    // Helper function to get the FormControl for each category
    getFormControlForCategory(categoryName: string) {
        const optionsArray = this.form.get('options') as FormArray;
        return optionsArray.controls.find(
            (control) => control.value === categoryName
        );
    }

    isSelected(categoryName: string): boolean {
        const optionsArray = this.form.get('options') as FormArray;
        return optionsArray.controls.some(
            (control) => control.value === categoryName
        );
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

    // Inside your component class
    get options() {
        return this.form.get('options') as FormArray;
    }

    setSelectedOptions() {
        const options = this.customer?.free_trial?.options?.split(',') || [];
        const optionsFormArray = this.form.get('options') as FormArray;

        // Add the selected options to the form array
        options.forEach((option) => {
            optionsFormArray.push(this.fb.control(option.trim()));
        });
    }

    onCheckboxChange(event: any, categoryName: string) {
        const optionsArray = this.form.get('options') as FormArray;
        if (event.target.checked) {
            optionsArray.push(this.fb.control(categoryName)); // Add to form array
        } else {
            const index = optionsArray.controls.findIndex(
                (control) => control.value === categoryName
            );
            if (index !== -1) {
                optionsArray.removeAt(index); // Remove from form array
            }
        }
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
                    name: this.name.value,
                    city: this.city.value,
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
