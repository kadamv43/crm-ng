import { Component } from '@angular/core';
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

@Component({
    selector: 'app-user-create',
    templateUrl: './user-create.component.html',
    styleUrl: './user-create.component.scss',
    providers: [MessageService],
})
export class UserCreateComponent {
    userForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private api: ApiService,
        private toast: MessageService,
        private router: Router
    ) {
        this.userForm = fb.group({
            first_name: ['', Validators.required],
            last_name: ['', Validators.required],
            mobile: ['', [Validators.required, this.mobileNumberValidator]],
            email: ['', [Validators.email, Validators.required]],
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
        user.password = 'pass';
        user.phone = '';

        if (this.userForm.valid) {
            this.api.createUser(user).subscribe((res: any) => {
                this.toast.add({
                    key: 'tst',
                    severity: 'success',
                    summary: 'Success Message',
                    detail: 'Staff added successfully',
                });
                setTimeout(() => {
                    this.router.navigateByUrl('users');
                }, 2000);
            });
        }
    }
}
