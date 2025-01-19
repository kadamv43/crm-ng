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
    selector: 'app-user-create',
    templateUrl: './user-create.component.html',
    styleUrl: './user-create.component.scss',
    providers: [MessageService],
})
export class UserCreateComponent implements OnInit {
    userForm: FormGroup;
    branches: any = [];
    tlList: any = [];
    adminList: any = [];
    showTlList = false;
    showAdminList = false;
    selectedRole = '';

    roles = [
        { name: 'Admin', code: 'admin' },
        { name: 'TeamLead', code: 'teamlead' },
        { name: 'Employee', code: 'employee' },
    ];

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
            target: ['', [Validators.required]],
            password: ['', [Validators.required]],
            role: ['', [Validators.required]],
            branch: ['', Validators.required],
            teamlead: [''],
            admin: [''],
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
    getAdminList() {
        let params = {};
        params['page'] = 0;
        params['size'] = 30;
        params['role'] = 'admin';
        params['branch'] = this.userForm.get('branch').value;
        let queryParams2 = this.commonService.getHttpParamsByJson(params);
        this.userService.getAll(queryParams2).subscribe({
            next: (res: any) => {
                this.adminList = res?.data?.map((element) => {
                    return { name: element.username, code: element._id };
                });
            },
        });
    }

    getTlList() {
        let params = {};
        params['page'] = 0;
        params['size'] = 30;
        params['role'] = 'teamlead';
        params['branch'] = this.userForm.get('branch').value;
        let queryParams2 = this.commonService.getHttpParamsByJson(params);
        this.userService.getAll(queryParams2).subscribe({
            next: (res: any) => {
                this.tlList = res?.data?.map((element) => {
                    return { name: element.username, code: element._id };
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

    get teamlead() {
        return this.userForm.get('teamlead');
    }

    get admin() {
        return this.userForm.get('admin');
    }

    get username() {
        return this.userForm.get('username');
    }

    get target() {
        return this.userForm.get('target');
    }

    get password() {
        return this.userForm.get('password');
    }

    get mobile() {
        return this.userForm.get('mobile');
    }

    get role() {
        return this.userForm.get('role');
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

    onRoleChange() {
        this.selectedRole = this.userForm.get('role').value;
        if (this.selectedRole == 'employee') {
            this.getTlList();
            this.userForm.get('teamlead')?.setValidators([Validators.required]);
            this.userForm.get('teamlead')?.updateValueAndValidity();
            this.userForm.get('admin')?.removeValidators([Validators.required]);
            this.userForm.get('admin')?.updateValueAndValidity();
            this.showTlList = true;
            this.showAdminList = false;
        } else if (this.selectedRole == 'teamlead') {
            this.getAdminList();
            this.userForm.get('admin')?.setValidators([Validators.required]);
            this.userForm.get('admin')?.updateValueAndValidity();
            this.userForm
                .get('teamlead')
                ?.removeValidators([Validators.required]);
            this.userForm.get('teamlead')?.updateValueAndValidity();
            this.showAdminList = true;
            this.showTlList = false;
        } else {
            this.userForm
                .get('teamlead')
                ?.removeValidators([Validators.required]);
            this.userForm.get('teamlead')?.updateValueAndValidity();
            this.userForm.get('admin')?.removeValidators([Validators.required]);
            this.userForm.get('admin')?.updateValueAndValidity();
            this.showTlList = false;
            this.showAdminList = false;
        }
    }
    async submitUser() {
        this.userForm.markAllAsTouched();
        let user = this.userForm.value;
        user.password_text = user.password;

        if (this.userForm.valid) {
            this.api.createUser(user).subscribe((res: any) => {
                this.toast.add({
                    key: 'tst',
                    severity: 'success',
                    summary: 'Success Message',
                    detail: 'Employee added successfully',
                });
                setTimeout(() => {
                    this.router.navigateByUrl('users');
                }, 2000);
            });
        }
    }
}
