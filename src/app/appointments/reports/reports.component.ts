import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AppointmentService } from 'src/app/services/appointment/appointment.service';
import { environment } from 'src/environments/environment';
import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer';

@Component({
    selector: 'app-reports',
    templateUrl: './reports.component.html',
    styleUrl: './reports.component.scss',
    providers: [MessageService],
})
export class ReportsComponent implements OnInit {
    uploadPath = environment.uploadPath;
    pdfSrc = 'https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf';

    id!: string;
    documents = [];
    queryParams = {};
    constructor(
        private route: ActivatedRoute,
        private appointmentService: AppointmentService,
        private toast: MessageService
    ) {}
    ngOnInit(): void {
        this.queryParams = this.route.snapshot.queryParams;
        this.route.paramMap.subscribe((params: ParamMap) => {
            this.id = params.get('id');
            this.appointmentService.findById(this.id).subscribe((res: any) => {
                this.documents = res?.files;
            });
        });
    }

    delete(id) {
        this.appointmentService.deleteReport(this.id, id).subscribe((res) => {
            this.documents = this.documents.filter((item: any) => {
                return item.id != id;
            });
            this.toast.add({
                key: 'tst',
                severity: 'error',
                summary: 'deleted ',
                detail: 'image deleted successfully',
            });
        });
    }
}
