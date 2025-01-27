import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { BanksService } from 'src/app/services/banks/banks.service';

@Component({
    selector: 'app-bank-create',
    templateUrl: './bank-create.component.html',
    styleUrl: './bank-create.component.scss',
    providers: [MessageService],
})
export class BankCreateComponent {
    form: FormGroup;

    constructor(
        private bankService: BanksService,
        private toast: MessageService,
        private router: Router,
        private fb: FormBuilder
    ) {
        this.form = this.fb.group({
            account_holder: ['', Validators.required],
            account_number: ['', Validators.required],
            bank_name: ['', Validators.required],
            ifsc_code: ['', [Validators.required]],
        });
    }

    get account_holder() {
        return this.form.get('account_holder');
    }
    get account_number() {
        return this.form.get('account_number');
    }

    get bank_name() {
        return this.form.get('bank_name');
    }

    get ifsc_code() {
        return this.form.get('ifsc_code');
    }

    async submit() {
        this.form.markAllAsTouched();
        if (this.form.valid) {
            this.bankService.create(this.form.value).subscribe((res) => {
                this.toast.add({
                    key: 'tst',
                    severity: 'success',
                    summary: 'Success Message',
                    detail: 'Bank created successfully',
                });
                setTimeout(() => {
                    this.router.navigateByUrl('banks');
                }, 2000);
            });
        }
    }
}
