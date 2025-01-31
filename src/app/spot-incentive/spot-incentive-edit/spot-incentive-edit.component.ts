import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { SpotIncentiveService } from 'src/app/services/spot-incentive/spot-incentive.service';

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

    roles = [
        { name: 'TeamLead', code: 'teamlead' },
        { name: 'Employee', code: 'employee' },
    ];

    constructor(
        private spotIncentiveService: SpotIncentiveService,
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
            this.spotIncentiveService
                .findById(this.id)
                .subscribe((res: any) => {
                    this.form.patchValue({
                        business: res?.business,
                        role: res?.role,
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
            this.spotIncentiveService
                .update(this.id, this.form.value)
                .subscribe({
                    next: (res) => {
                        this.loading = false;
                        this.toast.add({
                            key: 'tst',
                            severity: 'success',
                            summary: 'Success Message',
                            detail: 'Spot Incentive Updated successfully',
                        });
                        this.router.navigateByUrl('spot-incentives');
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
