import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { lastValueFrom } from 'rxjs';
import { HttpService } from 'src/app/services/http.service';

@Component({
    selector: 'app-upload-reports',
    templateUrl: './upload-reports.component.html',
    styleUrl: './upload-reports.component.scss',
})
export class UploadReportsComponent {
    fileUploadUrl = '';
    fileNameInput = false;
    acceptedFiles: string = '.pdf, .jpg, .png';
    reportForm: FormGroup;

    constructor(
        private messageService: MessageService,
        private dialogConfig: DynamicDialogConfig,
        private dialogService: DialogService,
        private http: HttpService,
        private fb: FormBuilder
    ) {}

    ngOnInit() {
        this.reportForm = this.fb.group({
            file: ['', Validators.required],
            report_name: ['', Validators.required],
        });

        this.fileNameInput = this.dialogConfig.data.fileNameInput;
        this.fileUploadUrl =
            this.fileUploadUrl + '/' + this.dialogConfig.data.id;
        this.acceptedFiles = this.dialogConfig.data.fileTypes;
        this.fileUploadUrl = this.dialogConfig.data?.fileUploadUrl;
    }

    file_name = '';
    selectedFile: File | null = null;

    uploadedFiles: any[] = [];

    onBeforeUpload(event) {
        if (this.file_name == '') {
            return;
        }
        event.formData.append('file_name', this.file_name);
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile = input.files[0];
            console.log(this.selectedFile);
        }
    }

    get report_name() {
        return this.reportForm.get('report_name');
    }

    get file() {
        return this.reportForm.get('file');
    }

    async onUpload() {
        this.reportForm.markAllAsTouched();
        console.log(this.reportForm);
        if (this.reportForm.valid) {
            const formData = new FormData();

            formData.append('file', this.selectedFile);
            formData.append('report_name', this.report_name.value);

            await lastValueFrom(
                this.http.postWithFormData(this.fileUploadUrl, formData)
            );

            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'File Uploaded',
            });

            this.dialogService.dialogComponentRefMap.forEach((dialog) => {
                dialog.destroy();
            });
        }
    }
}
