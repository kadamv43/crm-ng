import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DayOfferRoutingModule } from './day-offer-routing.module';
import { DayOfferCreateComponent } from './day-offer-create/day-offer-create.component';
import { DayOfferEditComponent } from './day-offer-edit/day-offer-edit.component';
import { DayOfferListComponent } from './day-offer-list/day-offer-list.component';
import { ToolbarModule } from 'primeng/toolbar';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PanelModule } from 'primeng/panel';
import { ToastModule } from 'primeng/toast';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';

@NgModule({
    declarations: [
        DayOfferCreateComponent,
        DayOfferEditComponent,
        DayOfferListComponent,
    ],
    imports: [
        ToolbarModule,
        TableModule,
        CalendarModule,
        InputTextModule,
        ButtonModule,
        ReactiveFormsModule,
        PanelModule,
        ToastModule,
        ConfirmPopupModule,
        CommonModule,
        FormsModule,
        DropdownModule,
        CommonModule,
        DayOfferRoutingModule,
    ],
})
export class DayOfferModule {}
