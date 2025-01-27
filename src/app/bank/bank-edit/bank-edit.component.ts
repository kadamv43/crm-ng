import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { BanksService } from 'src/app/services/banks/banks.service';

@Component({
    selector: 'app-bank-edit',
    templateUrl: './bank-edit.component.html',
    styleUrl: './bank-edit.component.scss',
    providers: [MessageService],
})
export class BankEditComponent implements OnInit {
    form: FormGroup;
    id: string;
    loading = false;

    constructor(
        private service: BanksService,
        private toast: MessageService,
        private router: Router,
        private fb: FormBuilder,
        private route: ActivatedRoute
    ) {
        this.form = this.fb.group({
            account_holder: ['', Validators.required],
            account_number: ['', Validators.required],
            bank_name: ['', Validators.required],
            ifsc_code: ['', [Validators.required]],
        });
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe((params: ParamMap) => {
            this.id = params.get('id');
            this.service.findById(this.id).subscribe((res: any) => {
                this.form.patchValue({
                    account_holder: res?.account_holder,
                    account_number: res?.account_number,
                    bank_name: res?.bank_name,
                    ifsc_code: res?.ifsc_code,
                });
            });
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
            this.loading = true;
            this.service.update(this.id, this.form.value).subscribe({
                next: (res) => {
                    this.loading = false;
                    this.toast.add({
                        key: 'tst',
                        severity: 'success',
                        summary: 'Success Message',
                        detail: 'Bank Updated successfully',
                    });
                    this.router.navigateByUrl('banks');
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
