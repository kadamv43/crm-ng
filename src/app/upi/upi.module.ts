import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UpiRoutingModule } from './upi-routing.module';
import { UpiEditComponent } from './upi-edit/upi-edit.component';
import { UpiCreateComponent } from './upi-create/upi-create.component';
import { UpiListComponent } from './upi-list/upi-list.component';
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
    declarations: [UpiEditComponent, UpiCreateComponent, UpiListComponent],
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
        UpiRoutingModule,
    ],
})
export class UpiModule {}
