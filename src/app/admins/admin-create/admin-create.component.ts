import { Component, OnInit } from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormControl,
    FormGroup,
    ValidationErrors,
    Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { concatMap, switchMap } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { BranchesService } from 'src/app/services/branches/branches.service';
import { CommonService } from 'src/app/services/common/common.service';
import { UsersService } from 'src/app/services/users/users.service';

@Component({
    selector: 'app-admin-create',
    templateUrl: './admin-create.component.html',
    styleUrl: './admin-create.component.scss',
    providers: [MessageService],
})
export class AdminCreateComponent {
    userForm: FormGroup;
    branches: any = [];
    selectedRole = '';

    constructor(
        private fb: FormBuilder,
        private api: ApiService,
        private toast: MessageService,
        private branchService: BranchesService,
        private userService: UsersService,
        private commonService: CommonService,
        private router: Router
    ) {
        this.userForm = fb.group({
            first_name: ['', Validators.required],
            last_name: ['', Validators.required],
            mobile: ['', [Validators.required, this.mobileNumberValidator]],
            email: ['', [Validators.email, Validators.required]],
            username: ['', [Validators.required]],
            password: ['', [Validators.required]],
            branch: ['', Validators.required],
        });
    }
    ngOnInit(): void {
        this.getBranchList();
    }

    getBranchList() {
        let params = {};
        params['page'] = 0;
        params['size'] = 30;

        let queryParams = this.commonService.getHttpParamsByJson(params);
        this.branchService.getAll(queryParams).subscribe({
            next: (res: any) => {
                this.branches = res?.data?.map((element) => {
                    return { name: element.name, code: element._id };
                });
            },
        });
    }

    get first_name() {
        return this.userForm.get('first_name');
    }
    get last_name() {
        return this.userForm.get('last_name');
    }
    get email() {
        return this.userForm.get('email');
    }

    get branch() {
        return this.userForm.get('branch');
    }

    get username() {
        return this.userForm.get('username');
    }

    get password() {
        return this.userForm.get('password');
    }

    get mobile() {
        return this.userForm.get('mobile');
    }

    mobileNumberValidator(control: AbstractControl): ValidationErrors | null {
        const mobilePattern = /^[0-9]{10}$/;
        if (control.value == '') {
            return null;
        }
        return mobilePattern.test(control.value)
            ? null
            : { invalidMobile: true };
    }

    async submitUser() {
        this.userForm.markAllAsTouched();
        let user = this.userForm.value;
        user.role = 'admin';
        user.password_text = user.password;

        if (this.userForm.valid) {
            this.api.createUser(user).subscribe({
                next: (res: any) => {
                    this.toast.add({
                        key: 'tst',
                        severity: 'success',
                        summary: 'Success Message',
                        detail: 'Admin added successfully',
                    });
                    setTimeout(() => {
                        this.router.navigateByUrl('admins');
                    }, 2000);
                },
                error: (err) => {
                    this.toast.add({
                        key: 'tst',
                        severity: 'error',
                        summary: 'Error Message',
                        detail: err?.error?.message,
                    });
                },
            });
        }
    }
}
