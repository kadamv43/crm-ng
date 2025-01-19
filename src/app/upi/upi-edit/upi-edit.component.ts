import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { BanksService } from 'src/app/services/banks/banks.service';
import { BranchesService } from 'src/app/services/branches/branches.service';
import { CommonService } from 'src/app/services/common/common.service';
import { PaymentLinksService } from 'src/app/services/payment-links/payment-links.service';
import { UpiService } from 'src/app/services/upi/upi.service';

@Component({
    selector: 'app-upi-edit',
    templateUrl: './upi-edit.component.html',
    styleUrl: './upi-edit.component.scss',
    providers: [MessageService],
})
export class UpiEditComponent {
    form: FormGroup;
    id: string;
    loading = false;
    branches: any = [];
    constructor(
        private service: UpiService,
        private toast: MessageService,
        private router: Router,
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private commonService: CommonService,
        private branchService: BranchesService
    ) {
        this.form = this.fb.group({
            upi_id: ['', Validators.required],
            upi_number: ['', Validators.required],
            branch: ['', Validators.required],
        });
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe((params: ParamMap) => {
            this.id = params.get('id');
            this.service.findById(this.id).subscribe((res: any) => {
                this.form.patchValue({
                    upi_id: res?.upi_id,
                    upi_number: res?.upi_number,
                    branch: res?.branch?._id,
                });
            });
        });

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
