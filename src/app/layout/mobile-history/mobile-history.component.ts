import { Component } from '@angular/core';
import { dA } from '@fullcalendar/core/internal-common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthService } from 'src/app/services/auth.service';
import { CommonService } from 'src/app/services/common/common.service';
import { UserLeadsService } from 'src/app/services/user-leads/user-leads.service';
import { ContactsService } from 'src/app/services/contacts/contacts.service';

@Component({
    selector: 'app-mobile-history',
    templateUrl: './mobile-history.component.html',
    styleUrl: './mobile-history.component.scss',
})
export class MobileHistoryComponent {
    mobile: any;

    visible = false;

    display = false;
    tableEvent;
    searchText = '';

    isExpanded: boolean = false;

    idFrozen: boolean = false;

    loading: boolean = false;

    role = '';

    totalRecords = 0;

    leads: any = [];

    // how often this number was handed out / worked, and who last worked it
    contactInfo: any = null;

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,
        public commonService: CommonService,
        public userLeadService: UserLeadsService,
        public authService: AuthService,
        private contactsService: ContactsService
    ) {
        this.mobile = config.data.mobile;
        console.log(this.mobile);
    }

    ngOnInit() {
        this.role = this.authService.getRole();

        if (this.mobile) {
            this.contactsService.lookup(this.mobile).subscribe({
                next: (res: any) => {
                    this.contactInfo = res?.[0] ?? null;
                },
                error: () => {
                    this.contactInfo = null; // the history table below still works
                },
            });
        }
    }

    loadData(event: any) {
        this.loading = true;

        const page = event.first / event.rows;
        const size = event.rows;

        let params = {};

        if (this.mobile != '') {
            params['mobile'] = this.mobile;
        }

        params['page'] = page;
        params['size'] = size;

        let queryParams = this.commonService.getHttpParamsByJson(params);
        this.userLeadService
            .getLeadHistory(queryParams)
            .subscribe((data: any) => {
                this.leads = data.data;
                this.totalRecords = data.total;
                this.loading = false;
            });

        console.log('api called');
    }
}
