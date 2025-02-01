import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DayOfferService } from 'src/app/services/day-offer/day-offer.service';
import { MonthlyIncentiveService } from 'src/app/services/monthly-incentive/monthly-incentive.service';

@Component({
    selector: 'app-day-offer-edit',
    templateUrl: './day-offer-edit.component.html',
    styleUrl: './day-offer-edit.component.scss',
    providers: [MessageService],
})
export class DayOfferEditComponent {
    form: FormGroup;
    minDate;
    id: string;
    loading = false;
    roles = [
        { name: 'TeamLead', code: 'teamlead' },
        { name: 'Employee', code: 'employee' },
    ];
    constructor(
        private dayOfferService: DayOfferService,
        private toast: MessageService,
        private router: Router,
        private fb: FormBuilder,
        private route: ActivatedRoute
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

    ngOnInit(): void {
        this.route.paramMap.subscribe((params: ParamMap) => {
            this.id = params.get('id');
            this.dayOfferService.findById(this.id).subscribe((res: any) => {
                this.form.patchValue({
                    business: res?.business,
                    incentive: res?.incentive,
                    offer_start_date: new Date(res?.offer_start_date),
                    offer_end_date: new Date(res?.offer_end_date),
                    role: res?.role,
                });
            });
        });
    }

    get offer_start_date() {
        return this.form.get('offer_start_date');
    }

    get offer_end_date() {
        return this.form.get('offer_end_date');
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

    async submit() {
        this.form.markAllAsTouched();
        if (this.form.valid) {
            this.loading = true;
            this.dayOfferService.update(this.id, this.form.value).subscribe({
                next: (res) => {
                    this.loading = false;
                    this.toast.add({
                        key: 'tst',
                        severity: 'success',
                        summary: 'Success Message',
                        detail: 'Day Offer Updated successfully',
                    });
                    this.router.navigateByUrl('day-offer');
                },
                error: (err) => {
                    this.toast.add({
                        key: 'tst',
                        severity: 'danger',
                        summary: 'Error Message',
                        detail: 'Something Went Wrong',
                    });
                },
            });
        }
    }
}
