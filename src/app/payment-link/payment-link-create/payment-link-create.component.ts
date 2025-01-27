import { Component } from '@angular/core';
import {
    AbstractControl,
    AsyncValidatorFn,
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { map, of, timer } from 'rxjs';
import { PaymentLinksService } from 'src/app/services/payment-links/payment-links.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-payment-link-create',
    templateUrl: './payment-link-create.component.html',
    styleUrl: './payment-link-create.component.scss',
    providers: [MessageService],
})
export class PaymentLinkCreateComponent {
    form: FormGroup;

    constructor(
        private service: PaymentLinksService,
        private toast: MessageService,
        private router: Router,
        private fb: FormBuilder
    ) {
        this.form = this.fb.group({
            name: ['', Validators.required],
            link: ['', Validators.required, this.urlAsyncValidator()],
        });
    }

    get name() {
        return this.form.get('name');
    }
    get link() {
        return this.form.get('link');
    }

    urlAsyncValidator(): AsyncValidatorFn {
        return (control: AbstractControl) => {
            if (!control.value) {
                return of(null); // If empty, no error
            }
            // Simulating async check with delay
            return timer(500).pipe(
                map(() => {
                    const validUrlPattern =
                        /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-]*)*(\?.*)?$/;
                    return validUrlPattern.test(control.value)
                        ? null
                        : { invalidUrl: true };
                })
            );
        };
    }

    async submit() {
        this.form.markAllAsTouched();
        if (this.form.valid) {
            this.service.create(this.form.value).subscribe((res) => {
                this.toast.add({
                    key: 'tst',
                    severity: 'success',
                    summary: 'Success Message',
                    detail: 'Payment Link created successfully',
                });
                setTimeout(() => {
                    this.router.navigateByUrl('payment-links');
                }, 2000);
            });
        }
    }
}
