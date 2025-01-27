import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { UpiService } from 'src/app/services/upi/upi.service';

@Component({
    selector: 'app-upi-create',
    templateUrl: './upi-create.component.html',
    styleUrl: './upi-create.component.scss',
    providers: [MessageService],
})
export class UpiCreateComponent {
    form: FormGroup;

    constructor(
        private service: UpiService,
        private toast: MessageService,
        private router: Router,
        private fb: FormBuilder
    ) {
        this.form = this.fb.group({
            upi_id: ['', Validators.required],
            upi_number: ['', Validators.required],
        });
    }

    get upi_id() {
        return this.form.get('upi_id');
    }
    get upi_number() {
        return this.form.get('upi_number');
    }

    async submit() {
        this.form.markAllAsTouched();
        if (this.form.valid) {
            this.service.create(this.form.value).subscribe((res) => {
                this.toast.add({
                    key: 'tst',
                    severity: 'success',
                    summary: 'Success Message',
                    detail: 'Upi created successfully',
                });
                setTimeout(() => {
                    this.router.navigateByUrl('upi');
                }, 2000);
            });
        }
    }
}
