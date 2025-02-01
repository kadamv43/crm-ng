import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DayOfferService } from 'src/app/services/day-offer/day-offer.service';
import { MonthlyIncentiveService } from 'src/app/services/monthly-incentive/monthly-incentive.service';

@Component({
    selector: 'app-day-offer-create',
    templateUrl: './day-offer-create.component.html',
    styleUrl: './day-offer-create.component.scss',
    providers: [MessageService],
})
export class DayOfferCreateComponent {
    form: FormGroup;
    minDate;
    roles = [
        { name: 'TeamLead', code: 'teamlead' },
        { name: 'Employee', code: 'employee' },
    ];

    constructor(
        private dayOfferService: DayOfferService,
        private toast: MessageService,
        private router: Router,
        private fb: FormBuilder
    ) {
        this.form = this.fb.group({
            business: [
                '',
                [Validators.required, Validators.pattern('^[0-9]*$')], // Allows only numbers
            ],
            role: ['', Validators.required],
            offer_start_date: ['', Validators.required],
            offer_end_date: ['', Validators.required],
            incentive: [
                '',
                [Validators.required, Validators.pattern('^[0-9]*$')], // Allows only numbers
            ],
        });
    }

    get business() {
        return this.form.get('business');
    }

    get incentive() {
        return this.form.get('incentive');
    }

    get role() {
        return this.form.get('role');
    }

    get offer_start_date() {
        return this.form.get('offer_start_date');
    }

    get offer_end_date() {
        return this.form.get('offer_end_date');
    }

    async submit() {
        this.form.markAllAsTouched();
        if (this.form.valid) {
            this.dayOfferService.create(this.form.value).subscribe((res) => {
                this.toast.add({
                    key: 'tst',
                    severity: 'success',
                    summary: 'Success Message',
                    detail: 'Day Offer created successfully',
                });
                setTimeout(() => {
                    this.router.navigateByUrl('day-offer');
                }, 2000);
            });
        }
    }
}
