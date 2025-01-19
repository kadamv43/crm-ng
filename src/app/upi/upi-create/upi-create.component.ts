import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { BanksService } from 'src/app/services/banks/banks.service';
import { BlogsService } from 'src/app/services/blogs/blogs.service';
import { BranchesService } from 'src/app/services/branches/branches.service';
import { CommonService } from 'src/app/services/common/common.service';
import { PaymentLinksService } from 'src/app/services/payment-links/payment-links.service';
import { UpiService } from 'src/app/services/upi/upi.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-upi-create',
    templateUrl: './upi-create.component.html',
    styleUrl: './upi-create.component.scss',
    providers: [MessageService],
})
export class UpiCreateComponent {
    form: FormGroup;
    branches: any = [];

    constructor(
        private service: UpiService,
        private commonService: CommonService,
        private branchService: BranchesService,
        private toast: MessageService,
        private router: Router,
        private fb: FormBuilder
    ) {
        this.form = this.fb.group({
            upi_id: ['', Validators.required],
            upi_number: ['', Validators.required],
            branch: ['', Validators.required],
        });
    }

    ngOnInit(): void {
        let params = {};
        params['page'] = 0;
        params['size'] = 30;

        let queryParams = this.commonService.getHttpParamsByJson(params);
        this.branchService.getAll(queryParams).subscribe({
            next: (res: any) => {
                this.branches = res?.data?.map((element) => {
                    return { name: element.name, code: element._id };
                });
            },
        });
    }

    get branch() {
        return this.form.get('branch');
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
