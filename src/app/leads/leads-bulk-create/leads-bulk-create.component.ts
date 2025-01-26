import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { BlogsService } from 'src/app/services/blogs/blogs.service';
import { BranchesService } from 'src/app/services/branches/branches.service';
import { environment } from 'src/environments/environment';
import * as FileSaver from 'file-saver';
import { HotLeadsService } from 'src/app/services/hot-leads/hot-leads.service';
import { LeadsService } from 'src/app/services/leads/leads.service';

@Component({
    selector: 'app-leads-bulk-create',
    templateUrl: './leads-bulk-create.component.html',
    styleUrl: './leads-bulk-create.component.scss',
    providers: [MessageService],
})
export class LeadsBulkCreateComponent {
    form: FormGroup;
    imageBasePath = environment.uploadPath;
    selectedFile: File | null = null;
    imagePreview: string | ArrayBuffer | null = null;

    constructor(
        private leadsService: LeadsService,
        private toast: MessageService,
        private router: Router,
        private fb: FormBuilder
    ) {
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

            this.leadsService.importExcel(formData).subscribe((res) => {
                this.toast.add({
                    key: 'tst',
                    severity: 'success',
                    summary: 'Success Message',
                    detail: 'Leads Imported successfully',
                });
                setTimeout(() => {
                    this.router.navigateByUrl('leads');
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
