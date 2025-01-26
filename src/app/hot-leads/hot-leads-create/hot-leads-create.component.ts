import { Component } from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    ValidationErrors,
    Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { BlogsService } from 'src/app/services/blogs/blogs.service';
import { BranchesService } from 'src/app/services/branches/branches.service';
import { HotLeadsService } from 'src/app/services/hot-leads/hot-leads.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-hot-leads-create',
    templateUrl: './hot-leads-create.component.html',
    styleUrl: './hot-leads-create.component.scss',
    providers: [MessageService],
})
export class HotLeadsCreateComponent {
    form: FormGroup;
    imageBasePath = environment.uploadPath;
    selectedFile: File | null = null;
    imagePreview: string | ArrayBuffer | null = null;

    constructor(
        private hotLeadsService: HotLeadsService,
        private toast: MessageService,
        private router: Router,
        private fb: FormBuilder
    ) {
        this.form = this.fb.group({
            mobile: ['', [Validators.required, this.mobileNumberValidator]],
            name: [''],
            city: [''],
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
            this.hotLeadsService.create(this.form.value).subscribe((res) => {
                this.toast.add({
                    key: 'tst',
                    severity: 'success',
                    summary: 'Success Message',
                    detail: 'Hot Lead created successfully',
                });
                setTimeout(() => {
                    this.router.navigateByUrl('hot-leads');
                }, 2000);
            });
        }
    }
}
