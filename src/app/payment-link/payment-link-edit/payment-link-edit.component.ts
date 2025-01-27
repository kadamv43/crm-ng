import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { PaymentLinksService } from 'src/app/services/payment-links/payment-links.service';

@Component({
    selector: 'app-payment-link-edit',
    templateUrl: './payment-link-edit.component.html',
    styleUrl: './payment-link-edit.component.scss',
    providers: [MessageService],
})
export class PaymentLinkEditComponent implements OnInit {
    form: FormGroup;
    id: string;
    loading = false;

    constructor(
        private service: PaymentLinksService,
        private toast: MessageService,
        private router: Router,
        private fb: FormBuilder,
        private route: ActivatedRoute
    ) {
        this.form = this.fb.group({
            name: ['', Validators.required],
            link: ['', Validators.required],
        });
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe((params: ParamMap) => {
            this.id = params.get('id');
            this.service.findById(this.id).subscribe((res: any) => {
                this.form.patchValue({
                    link: res?.link,
                    name: res?.name,
                });
            });
        });
    }

    get name() {
        return this.form.get('name');
    }
    get link() {
        return this.form.get('link');
    }

    async submit() {
        this.form.markAllAsTouched();
        if (this.form.valid) {
            this.loading = true;
            this.service.update(this.id, this.form.value).subscribe({
                next: (res) => {
                    this.loading = false;
                    this.toast.add({
                        key: 'tst',
                        severity: 'success',
                        summary: 'Success Message',
                        detail: 'Payment Link Updated successfully',
                    });
                    this.router.navigateByUrl('payment-links');
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
