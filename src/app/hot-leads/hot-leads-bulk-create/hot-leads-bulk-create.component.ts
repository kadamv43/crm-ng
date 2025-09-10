import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import * as FileSaver from 'file-saver';
import { HotLeadsService } from 'src/app/services/hot-leads/hot-leads.service';
import { HttpService } from 'src/app/services/http.service';

@Component({
    selector: 'app-hot-leads-bulk-create',
    templateUrl: './hot-leads-bulk-create.component.html',
    styleUrl: './hot-leads-bulk-create.component.scss',
    providers: [MessageService],
})
export class HotLeadsBulkCreateComponent {
    form: FormGroup;
    imageBasePath = '';
    selectedFile: File | null = null;
    imagePreview: string | ArrayBuffer | null = null;

    constructor(
        private hotLeadsService: HotLeadsService,
        private toast: MessageService,
        private router: Router,
        private fb: FormBuilder,
        private http: HttpService
    ) {
        this.imageBasePath = this.http.currentUploadPath;
        this.form = this.fb.group({
            file: ['', Validators.required],
        });
    }

    get file() {
        return this.form.get('file');
    }

    onFileSelected(event: any): void {
        this.selectedFile = event.target.files[0];
        if (this.selectedFile) {
            const reader = new FileReader();
            // Read the image file as a data URL
            reader.readAsDataURL(this.selectedFile);
            console.log(this.selectedFile);
        }
    }

    async submit() {
        this.form.markAllAsTouched();
        if (this.form.valid) {
            const formData = new FormData();
            formData.append('file', this.selectedFile, this.selectedFile.name);

            this.hotLeadsService.importExcel(formData).subscribe((res) => {
                this.toast.add({
                    key: 'tst',
                    severity: 'success',
                    summary: 'Success Message',
                    detail: 'Hot Leads Imported successfully',
                });
                setTimeout(() => {
                    this.router.navigateByUrl('hot-leads');
                }, 2000);
            });
        }
    }
    exportExcel() {
        let json: any = [
            {
                mobile: '',
                name: '',
                city: '',
                investment: '',
            },
        ];
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(json);
            const workbook = {
                Sheets: { data: worksheet },
                SheetNames: ['data'],
            };
            const excelBuffer: any = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array',
            });
            this.saveAsExcelFile(excelBuffer, 'sample_hot_leads');
        });
    }

    saveAsExcelFile(buffer: any, fileName: string): void {
        let EXCEL_TYPE =
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        let EXCEL_EXTENSION = '.xlsx';
        const data: Blob = new Blob([buffer], {
            type: EXCEL_TYPE,
        });
        FileSaver.saveAs(
            data,
            fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION
        );
    }
}
