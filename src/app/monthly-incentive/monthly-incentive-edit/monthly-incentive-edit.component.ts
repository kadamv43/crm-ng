import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { BranchesService } from 'src/app/services/branches/branches.service';
import { MonthlyIncentiveService } from 'src/app/services/monthly-incentive/monthly-incentive.service';

@Component({
    selector: 'app-monthly-incentive-edit',
    templateUrl: './monthly-incentive-edit.component.html',
    styleUrl: './monthly-incentive-edit.component.scss',
    providers: [MessageService],
})
export class MonthlyIncentiveEditComponent {
    form: FormGroup;
    id: string;
    loading = false;
    roles = [
        { name: 'TeamLead', code: 'teamlead' },
        { name: 'Employee', code: 'employee' },
    ];
    constructor(
        private monthlyIncentiveService: MonthlyIncentiveService,
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
            incentive: [
                '',
                [Validators.required, Validators.pattern('^[0-9]*$')], // Allows only numbers
            ],
        });
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe((params: ParamMap) => {
            this.id = params.get('id');
            this.monthlyIncentiveService
                .findById(this.id)
                .subscribe((res: any) => {
                    this.form.patchValue({
                        business: res?.business,
                        incentive: res?.incentive,
                    });
                });
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

    async submit() {
        this.form.markAllAsTouched();
        if (this.form.valid) {
            this.loading = true;
            this.monthlyIncentiveService
                .update(this.id, this.form.value)
                .subscribe({
                    next: (res) => {
                        this.loading = false;
                        this.toast.add({
                            key: 'tst',
                            severity: 'success',
                            summary: 'Success Message',
                            detail: 'Monthly Incentive Updated successfully',
                        });
                        this.router.navigateByUrl('monthly-incentives');
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
