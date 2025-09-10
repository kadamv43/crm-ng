import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { BranchesService } from 'src/app/services/branches/branches.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-branch-create',
    templateUrl: './branch-create.component.html',
    styleUrl: './branch-create.component.scss',
    providers: [MessageService],
})
export class BranchCreateComponent implements OnInit {
    form: FormGroup;
    minDate;
    statusList: any = [
        {
            name: 'Active',
            code: 'Active',
        },
        { name: 'Inactive', code: 'Inactive' },
    ];

    constructor(
        private branchesService: BranchesService,
        private toast: MessageService,
        private router: Router,
        private fb: FormBuilder
    ) {
        this.form = this.fb.group({
            name: ['', Validators.required],
            address: ['', Validators.required],
            max_users: ['', Validators.required],
            status: ['', Validators.required],
            expiry_date: ['', Validators.required],
        });
    }
    ngOnInit(): void {
        this.minDate = new Date();
    }

    get name() {
        return this.form.get('name');
    }

    get address() {
        return this.form.get('address');
    }

    get status() {
        return this.form.get('status');
    }

    get max_users() {
        return this.form.get('max_users');
    }

    get expiry_date() {
        return this.form.get('expiry_date');
    }
    async submit() {
        this.form.markAllAsTouched();
        if (this.form.valid) {
            this.branchesService.create(this.form.value).subscribe((res) => {
                this.toast.add({
                    key: 'tst',
                    severity: 'success',
                    summary: 'Success Message',
                    detail: 'Company created successfully',
                });
                setTimeout(() => {
                    this.router.navigateByUrl('branches');
                }, 2000);
            });
        }
    }
}
