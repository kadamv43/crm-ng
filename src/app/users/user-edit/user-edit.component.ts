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

@Component({
    selector: 'app-user-edit',
    templateUrl: './user-edit.component.html',
    styleUrl: './user-edit.component.scss',
    providers: [MessageService],
})
export class UserEditComponent implements OnInit {
    userForm: FormGroup;
    id: string;

    roles = [
        { name: 'Admin', code: 'admin' },
        { name: 'TeamLead', code: 'teamlead' },
        { name: 'Employee', code: 'employee' },
    ];

    constructor(
        private fb: FormBuilder,
        private api: ApiService,
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
            password: ['', Validators.required],
            role: ['', Validators.required],
            target: ['', Validators.required],
        });
    }
    ngOnInit(): void {
        this.route.paramMap.subscribe((params: ParamMap) => {
            this.id = params.get('id');
            this.api.getUserById(this.id).subscribe((res: any) => {
                console.log(res);
                this.userForm.patchValue({
                    first_name: res.first_name,
                    last_name: res.last_name,
                    email: res.email,
                    mobile: res?.mobile,
                    role: res?.role,
                    username: res?.username,
                    target: res?.target,
                });
            });
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
