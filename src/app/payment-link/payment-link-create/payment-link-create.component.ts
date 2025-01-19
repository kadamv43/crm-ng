import { Component, OnInit } from '@angular/core';
import {
    AbstractControl,
    AsyncValidator,
    AsyncValidatorFn,
    FormBuilder,
    FormGroup,
    ValidationErrors,
    Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { map, of, timer } from 'rxjs';
import { BanksService } from 'src/app/services/banks/banks.service';
import { BlogsService } from 'src/app/services/blogs/blogs.service';
import { BranchesService } from 'src/app/services/branches/branches.service';
import { CommonService } from 'src/app/services/common/common.service';
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
    branches: any = [];

    constructor(
        private service: PaymentLinksService,
        private commonService: CommonService,
        private branchService: BranchesService,
        private toast: MessageService,
        private router: Router,
        private fb: FormBuilder
    ) {
        this.form = this.fb.group({
            name: ['', Validators.required],
            link: ['', Validators.required, this.urlAsyncValidator()],
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
