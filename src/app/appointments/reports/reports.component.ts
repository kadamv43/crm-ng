import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { AppointmentService } from 'src/app/services/appointment/appointment.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-reports',
    templateUrl: './reports.component.html',
    styleUrl: './reports.component.scss',
})
export class ReportsComponent implements OnInit {
    id!: string;
    documents = []
    constructor(
        private route: ActivatedRoute,
        private appointmentService: AppointmentService
    ) {}
    ngOnInit(): void {
        this.route.paramMap.subscribe((params: ParamMap) => {
            this.id = params.get('id');
            this.appointmentService
                .findById(this.id)
                .subscribe((res: any) =>{
                  this.documents = res?.files.map((item)=>{
                        item.file = environment.baseUrl+item.file
                        return item
                  })
                });
        });
    }
}
