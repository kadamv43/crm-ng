import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { BlogsService } from 'src/app/services/blogs/blogs.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-bank-create',
    templateUrl: './bank-create.component.html',
    styleUrl: './bank-create.component.scss',
    providers: [MessageService],
})
export class BankCreateComponent {
    bankForm: FormGroup;
    imageBasePath = environment.uploadPath;
    selectedFile: File | null = null;
    imagePreview: string | ArrayBuffer | null = null;

    constructor(
        private blogService: BlogsService,
        private toast: MessageService,
        private router: Router,
        private fb: FormBuilder
    ) {
        this.bankForm = this.fb.group({
            account_holder: ['', Validators.required],
            account_number: ['', Validators.required],
            bank_name: ['', Validators.required],
            ifsc_code: ['', [Validators.required]],
        });
    }

    statusList = [
        { name: 'Active', code: 'Active' },
        { name: 'Inactive', code: 'Inactive' },
    ];

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

    get status() {
        return this.bankForm.get('status');
    }
    get description() {
        return this.bankForm.get('description');
    }

    onFileSelected(event: any): void {
        this.selectedFile = event.target.files[0];
        if (this.selectedFile) {
            const reader = new FileReader();

            reader.onload = () => {
                this.imagePreview = reader.result;
            };

            // Read the image file as a data URL
            reader.readAsDataURL(this.selectedFile);
        }
    }

    async submit() {
        this.bankForm.markAllAsTouched();
        if (this.bankForm.valid) {
            const formData = new FormData();
            formData.append('title', this.bankForm.get('title')?.value);
            formData.append('image', this.selectedFile, this.selectedFile.name);
            formData.append(
                'description',
                this.bankForm.get('description')?.value
            );
            formData.append('status', this.bankForm.get('status')?.value);
            this.blogService.create(formData).subscribe((res) => {
                this.toast.add({
                    key: 'tst',
                    severity: 'success',
                    summary: 'Success Message',
                    detail: 'Blog created successfully',
                });
                setTimeout(() => {
                    this.router.navigateByUrl('blogs');
                }, 2000);
            });
        }
    }
}
