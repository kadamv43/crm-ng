import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { BanksService } from 'src/app/services/banks/banks.service';
import { BlogsService } from 'src/app/services/blogs/blogs.service';
import { BranchesService } from 'src/app/services/branches/branches.service';
import { CommonService } from 'src/app/services/common/common.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-bank-create',
    templateUrl: './bank-create.component.html',
    styleUrl: './bank-create.component.scss',
    providers: [MessageService],
})
export class BankCreateComponent implements OnInit {
    bankForm: FormGroup;
    branches: any = [];

    constructor(
        private bankService: BanksService,
        private commonService: CommonService,
        private branchService: BranchesService,
        private toast: MessageService,
        private router: Router,
        private fb: FormBuilder
    ) {
        this.bankForm = this.fb.group({
            account_holder: ['', Validators.required],
            account_number: ['', Validators.required],
            bank_name: ['', Validators.required],
            branch: ['', Validators.required],
            ifsc_code: ['', [Validators.required]],
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
        return this.bankForm.get('branch');
    }

    get account_holder() {
        return this.bankForm.get('account_holder');
    }
    get account_number() {
        return this.bankForm.get('account_number');
    }

    get bank_name() {
        return this.bankForm.get('bank_name');
    }

    get ifsc_code() {
        return this.bankForm.get('ifsc_code');
    }

    async submit() {
        this.bankForm.markAllAsTouched();
        if (this.bankForm.valid) {
            this.bankService.create(this.bankForm.value).subscribe((res) => {
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
