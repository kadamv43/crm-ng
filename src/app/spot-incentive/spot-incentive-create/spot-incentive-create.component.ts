import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { SpotIncentiveService } from 'src/app/services/spot-incentive/spot-incentive.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-spot-incentive-create',
    templateUrl: './spot-incentive-create.component.html',
    styleUrl: './spot-incentive-create.component.scss',
    providers: [MessageService],
})
export class SpotIncentiveCreateComponent {
    roles = [
        { name: 'TeamLead', code: 'teamlead' },
        { name: 'Employee', code: 'employee' },
    ];
    form: FormGroup;
    constructor(
        private spotIncentiveService: SpotIncentiveService,
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

    async submit() {
        this.form.markAllAsTouched();
        if (this.form.valid) {
            this.spotIncentiveService
                .create(this.form.value)
                .subscribe((res) => {
                    this.toast.add({
                        key: 'tst',
                        severity: 'success',
                        summary: 'Success Message',
                        detail: 'Spot Incentive created successfully',
                    });
                    setTimeout(() => {
                        this.router.navigateByUrl('spot-incentives');
                    }, 2000);
                });
        }
    }
}
