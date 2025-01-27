import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { BranchesService } from 'src/app/services/branches/branches.service';
import { MonthlyIncentiveService } from 'src/app/services/monthly-incentive/monthly-incentive.service';

@Component({
    selector: 'app-spot-incentive-edit',
    templateUrl: './spot-incentive-edit.component.html',
    providers: [MessageService],
    styleUrl: './spot-incentive-edit.component.scss',
})
export class SpotIncentiveEditComponent {
    form: FormGroup;
    id: string;
    loading = false;
    constructor(
        private monthlyIncentiveService: MonthlyIncentiveService,
        private toast: MessageService,
        private router: Router,
        private fb: FormBuilder,
        private route: ActivatedRoute
    ) {
        this.form = this.fb.group({
            business: ['', Validators.required],
            incentive: ['', Validators.required],
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
