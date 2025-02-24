import { Component, ElementRef, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from './service/app.layout.service';
import { AuthService } from '../services/auth.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { NotepadComponent } from './notepad/notepad.component';
import { UserLeadsService } from '../services/user-leads/user-leads.service';
import { MobileHistoryComponent } from './mobile-history/mobile-history.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html',
    providers: [DialogService],
})
export class AppTopBarComponent {
    items!: MenuItem[];
    ref: DynamicDialogRef | undefined;

    @ViewChild('menubutton') menuButton!: ElementRef;

    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

    @ViewChild('topbarmenu') menu!: ElementRef;

    mobileForm: FormGroup;

    constructor(
        public layoutService: LayoutService,
        private authService: AuthService,
        public dialogService: DialogService,
        public userLeadService: UserLeadsService,
        private fb: FormBuilder
    ) {
        this.mobileForm = this.fb.group({
            mobile: [
                '',
                [Validators.required, Validators.pattern(/^[0-9]{10}$/)],
            ],
        });
    }

    get mobile() {
        return this.mobileForm.get('mobile');
    }

    logout() {
        this.authService.logout();
    }

    openNotepad() {
        this.ref = this.dialogService.open(NotepadComponent, {
            header: 'Notepad',
            width: '70%',
            contentStyle: { overflow: 'auto' },
            baseZIndex: 10000,
            maximizable: true,
        });
    }

    searchHistroy() {
        this.mobileForm.markAllAsTouched();
        if (this.mobileForm.valid) {
            this.ref = this.dialogService.open(MobileHistoryComponent, {
                data: {
                    mobile: this.mobile.value,
                },
                width: '100%',
                header: 'Mobile History',
            });

            this.ref.onClose.subscribe((result) => {
                console.log('closed');
            });
        }
    }
}
