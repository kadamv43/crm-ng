import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
    providers: [MessageService],
})
export class LoginComponent {
    valCheck: string[] = ['remember'];
    loading = false;

    display = false;

    loginForm: FormGroup;

    constructor(
        public layoutService: LayoutService,
        private fb: FormBuilder,
        private apiService: ApiService,
        private messageService: MessageService,
        private router: Router
    ) {
        this.loginForm = fb.group({
            username: ['', Validators.required],
            password: ['', Validators.required],
        });
    }

    get username() {
        return this.loginForm.get('username');
    }

    get password() {
        return this.loginForm.get('password');
    }

    login() {
        this.loginForm.markAllAsTouched();
        if (this.loginForm.valid) {
            this.loading = true;
            this.apiService.login(this.loginForm.value).subscribe(
                (res: any) => {
                    let token = res.accessToken;
                    localStorage.setItem('token', token);

                    this.apiService
                        .getAuthUserDetails()
                        .subscribe(async (res: any) => {
                            localStorage.setItem('mobile', res?.mobile);
                            localStorage.setItem('role', res.role);
                            this.apiService.getAppConfig().subscribe({
                                next: (res) => {
                                    localStorage.setItem(
                                        'config',
                                        JSON.stringify(res)
                                    );
                                },
                            });

                            setTimeout(() => {
                                this.loading = false;
                                this.router.navigateByUrl('/');
                            }, 2000);
                        });
                },
                (err) => {
                    this.loading = false;

                    if (err.status == 403) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: err?.error?.message,
                        });
                    }

                    if (err.status == 401) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Login failed',
                            detail: 'Invalid Credentials',
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
