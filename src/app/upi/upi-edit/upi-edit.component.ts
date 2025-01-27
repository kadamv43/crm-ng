import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { UpiService } from 'src/app/services/upi/upi.service';

@Component({
    selector: 'app-upi-edit',
    templateUrl: './upi-edit.component.html',
    styleUrl: './upi-edit.component.scss',
    providers: [MessageService],
})
export class UpiEditComponent implements OnInit {
    form: FormGroup;
    id: string;
    loading = false;

    constructor(
        private service: UpiService,
        private toast: MessageService,
        private router: Router,
        private fb: FormBuilder,
        private route: ActivatedRoute
    ) {
        this.form = this.fb.group({
            upi_id: ['', Validators.required],
            upi_number: ['', Validators.required],
        });
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe((params: ParamMap) => {
            this.id = params.get('id');
            this.service.findById(this.id).subscribe((res: any) => {
                this.form.patchValue({
                    upi_id: res?.upi_id,
                    upi_number: res?.upi_number,
                });
            });
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
            this.loading = true;
            this.service.update(this.id, this.form.value).subscribe({
                next: (res) => {
                    this.loading = false;
                    this.toast.add({
                        key: 'tst',
                        severity: 'success',
                        summary: 'Success Message',
                        detail: 'UPI Updated successfully',
                    });
                    this.router.navigateByUrl('upi');
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
