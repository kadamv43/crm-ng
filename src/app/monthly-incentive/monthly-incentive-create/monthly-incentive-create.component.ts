import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { BlogsService } from 'src/app/services/blogs/blogs.service';
import { BranchesService } from 'src/app/services/branches/branches.service';
import { MonthlyIncentiveService } from 'src/app/services/monthly-incentive/monthly-incentive.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-monthly-incentive-create',
    templateUrl: './monthly-incentive-create.component.html',
    styleUrl: './monthly-incentive-create.component.scss',
    providers: [MessageService],
})
export class MonthlyIncentiveCreateComponent {
    form: FormGroup;
    imageBasePath = environment.uploadPath;
    selectedFile: File | null = null;
    imagePreview: string | ArrayBuffer | null = null;
    minDate;

    constructor(
        private monthlyIncentiveService: MonthlyIncentiveService,
        private toast: MessageService,
        private router: Router,
        private fb: FormBuilder
    ) {
        this.form = this.fb.group({
            business: ['', Validators.required],
            incentive: ['', Validators.required],
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
            this.monthlyIncentiveService
                .create(this.form.value)
                .subscribe((res) => {
                    this.toast.add({
                        key: 'tst',
                        severity: 'success',
                        summary: 'Success Message',
                        detail: 'Monthly Incentive created successfully',
                    });
                    setTimeout(() => {
                        this.router.navigateByUrl('monthly-incentives');
                    }, 2000);
                });
        }
    }
}
