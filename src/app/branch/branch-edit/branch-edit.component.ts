import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { BranchesService } from 'src/app/services/branches/branches.service';

@Component({
    selector: 'app-branch-edit',
    templateUrl: './branch-edit.component.html',
    styleUrl: './branch-edit.component.scss',
    providers: [MessageService],
})
export class BranchEditComponent implements OnInit {
    form: FormGroup;
    id: string;
    loading = false;
    minDate;
    constructor(
        private branchesService: BranchesService,
        private toast: MessageService,
        private router: Router,
        private fb: FormBuilder,
        private route: ActivatedRoute
    ) {
        this.form = this.fb.group({
            name: ['', Validators.required],
            address: ['', Validators.required],
            max_users: ['', Validators.required],
            expiry_date: ['', Validators.required],
        });
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe((params: ParamMap) => {
            this.id = params.get('id');
            this.branchesService.findById(this.id).subscribe((res: any) => {
                this.form.patchValue({
                    name: res?.name,
                    max_users: res?.max_users,
                    expiry_date: res?.expiry_date
                        ? new Date(res.expiry_date)
                        : null,
                    address: res?.address,
                });
            });
        });

        this.minDate = new Date();
    }

    get name() {
        return this.form.get('name');
    }
    get address() {
        return this.form.get('address');
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
            this.loading = true;
            this.branchesService.update(this.id, this.form.value).subscribe({
                next: (res) => {
                    this.loading = false;
                    this.toast.add({
                        key: 'tst',
                        severity: 'success',
                        summary: 'Success Message',
                        detail: 'Company Updated successfully',
                    });
                    this.router.navigateByUrl('branches');
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
