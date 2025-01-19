import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
    selector: 'app-new-password',
    providers: [MessageService],
    templateUrl: './new-password.component.html',
    styleUrl: './new-password.component.scss',
})
export class NewPasswordComponent implements OnInit {
    valCheck: string[] = ['remember'];

    id: string;
    display = false;
    visible: boolean = false;

    loginForm: FormGroup;

    constructor(
        public layoutService: LayoutService,
        private fb: FormBuilder,
        private apiService: ApiService,
        private messageService: MessageService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.loginForm = fb.group(
            {
                password: ['', [Validators.required]],
                conf_password: ['', [Validators.required]],
                otp: ['', Validators.required],
            },
            { validator: this.passwordMatchValidator } // Attach the custom validator
        );
    }
    ngOnInit(): void {
        this.route.paramMap.subscribe((params: ParamMap) => {
            this.id = params.get('id');
        });
    }

    passwordMatchValidator(group: FormGroup) {
        const password = group.get('password')?.value;
        const confirmPassword = group.get('conf_password')?.value;
        return password === confirmPassword ? null : { mismatch: true };
    }

    get password() {
        return this.loginForm.get('password');
    }

    get conf_password() {
        return this.loginForm.get('conf_password');
    }

    get otp() {
        return this.loginForm.get('otp');
    }

    checkEmail() {
        this.loginForm.markAllAsTouched();
        if (this.loginForm.valid) {
            this.apiService
                .resetPassword(this.id, this.loginForm.value)
                .subscribe(
                    (res: any) => {
                        this.visible = true;
                        // this.router.navigateByUrl('auth/login');
                    },
                    (err) => {
                        if (err.status == 401) {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Invalid code provided',
                                detail: 'Invalid code',
                            });

                            setTimeout(() => {
                                this.messageService.clear();
                            }, 3000);
                        }
                    }
                );
        }
    }
    goTo(url) {
        this.router.navigateByUrl(url);
    }
}
