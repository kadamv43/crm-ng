import { Component, OnInit } from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormControl,
    FormGroup,
    ValidationErrors,
    Validators,
} from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ApiService } from 'src/app/services/api.service';
import { BranchesService } from 'src/app/services/branches/branches.service';
import { CommonService } from 'src/app/services/common/common.service';
import { UsersService } from 'src/app/services/users/users.service';

@Component({
    selector: 'app-user-edit',
    templateUrl: './user-edit.component.html',
    styleUrl: './user-edit.component.scss',
    providers: [MessageService],
})
export class UserEditComponent implements OnInit {
    userForm: FormGroup;
    id: string;
    branches: any = [];
    tlList: any = [];
    showTlList = false;
    roles = [
        { name: 'Admin', code: 'admin' },
        { name: 'TeamLead', code: 'teamlead' },
        { name: 'Employee', code: 'employee' },
    ];

    constructor(
        private fb: FormBuilder,
        private api: ApiService,
        private commonService: CommonService,
        private branchService: BranchesService,
        private userService: UsersService,
        private toast: MessageService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.userForm = fb.group({
            first_name: ['', Validators.required],
            last_name: ['', Validators.required],
            mobile: ['', [Validators.required, this.mobileNumberValidator]],
            email: ['', [Validators.email, Validators.required]],
            username: ['', Validators.required],
            password: [''],
            role: ['', Validators.required],
            target: ['', Validators.required],
            teamlead: [''],
        });
    }
    ngOnInit(): void {
        this.route.paramMap.subscribe((params: ParamMap) => {
            this.id = params.get('id');

            this.api.getUserById(this.id).subscribe((res: any) => {
                if (res?.role == 'employee' && res?.teamlead) {
                    this.showTlList = true;
                }
                this.userForm.patchValue({
                    first_name: res.first_name,
                    last_name: res.last_name,
                    email: res.email,
                    mobile: res?.mobile,
                    role: res?.role,
                    username: res?.username,
                    target: res?.target,
                    password: res?.password_text,
                });

                if (res?.role == 'employee' && res?.teamlead) {
                    this.userForm.patchValue({
                        teamlead: res?.teamlead,
                    });
                }
            });
        });

        this.getApis();
    }

    getApis(): void {
        let params = {};
        params['page'] = 0;
        params['size'] = 30;
        params['role'] = 'teamlead';
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

    get mobile() {
        return this.userForm.get('mobile');
    }

    get username() {
        return this.userForm.get('username');
    }
    get password() {
        return this.userForm.get('password');
    }

    get role() {
        return this.userForm.get('role');
    }

    get teamlead() {
        return this.userForm.get('teamlead');
    }

    get target() {
        return this.userForm.get('target');
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

    submitUser() {
        this.userForm.markAllAsTouched();
        let user = this.userForm.value;
        user.password_text = user.password;
        if (user.teamlead == '') {
            delete user.teamlead;
        }

        if (this.userForm.valid) {
            this.api.updateUser(this.id, user).subscribe((res) => {
                this.toast.add({
                    key: 'tst',
                    severity: 'success',
                    summary: 'Success Message',
                    detail: 'Employee updated successfully',
                });
                setTimeout(() => {
                    this.router.navigateByUrl('users');
                }, 2000);
            });
        }
    }
}
