import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaymentLinkRoutingModule } from './payment-link-routing.module';
import { PaymentLinkCreateComponent } from './payment-link-create/payment-link-create.component';
import { PaymentLinkEditComponent } from './payment-link-edit/payment-link-edit.component';
import { PaymentLinkListComponent } from './payment-link-list/payment-link-list.component';
import { ToolbarModule } from 'primeng/toolbar';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { ReactiveFormsModule } from '@angular/forms';
import { PanelModule } from 'primeng/panel';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToastModule } from 'primeng/toast';
import { EditorModule } from 'primeng/editor';

@NgModule({
    declarations: [
        PaymentLinkCreateComponent,
        PaymentLinkEditComponent,
        PaymentLinkListComponent,
    ],
    imports: [
        ToolbarModule,
        TableModule,
        InputTextModule,
        CalendarModule,
        ButtonModule,
        ReactiveFormsModule,
        PanelModule,
        DropdownModule,
        MultiSelectModule,
        ToastModule,
        EditorModule,
        CommonModule,
        PaymentLinkRoutingModule,
    ],
})
export class PaymentLinkModule {}
