import { Component } from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    ValidationErrors,
    Validators,
} from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { BranchesService } from 'src/app/services/branches/branches.service';
import { HotLeadsService } from 'src/app/services/hot-leads/hot-leads.service';

@Component({
    selector: 'app-hot-leads-edit',
    templateUrl: './hot-leads-edit.component.html',
    styleUrl: './hot-leads-edit.component.scss',
    providers: [MessageService],
})
export class HotLeadsEditComponent {
    form: FormGroup;
    id: string;
    loading = false;
    constructor(
        private hotLeadsService: HotLeadsService,
        private toast: MessageService,
        private router: Router,
        private fb: FormBuilder,
        private route: ActivatedRoute
    ) {
        this.form = this.fb.group({
            mobile: ['', [Validators.required, this.mobileNumberValidator]],
            name: [''],
            city: [''],
        });
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe((params: ParamMap) => {
            this.id = params.get('id');
            this.hotLeadsService.findById(this.id).subscribe((res: any) => {
                this.form.patchValue({
                    mobile: res?.mobile,
                    name: res?.name,
                    city: res?.city,
                });
            });
        });
    }

    get mobile() {
        return this.form.get('mobile');
    }

    get name() {
        return this.form.get('name');
    }

    get city() {
        return this.form.get('city');
    }

    mobileNumberValidator(control: AbstractControl): ValidationErrors | null {
        const mobilePattern = /^[0-9]{10}$/;
        if (control.value == '') {
            return null;
        }
        return mobilePattern.test(control.value)
            ? null
            : { invalidMobile: true };
    }

    async submit() {
        this.form.markAllAsTouched();
        if (this.form.valid) {
            this.loading = true;
            this.hotLeadsService.update(this.id, this.form.value).subscribe({
                next: (res) => {
                    this.loading = false;
                    this.toast.add({
                        key: 'tst',
                        severity: 'success',
                        summary: 'Success Message',
                        detail: 'Hot Lead Updated successfully',
                    });
                    this.router.navigateByUrl('hot-leads');
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
