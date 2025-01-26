import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LeadsRoutingModule } from './leads-routing.module';
import { LeadsBulkCreateComponent } from './leads-bulk-create/leads-bulk-create.component';
import { LeadsCreateComponent } from './leads-create/leads-create.component';
import { LeadsListComponent } from './leads-list/leads-list.component';
import { LeadsEditComponent } from './leads-edit/leads-edit.component';
import { ToolbarModule } from 'primeng/toolbar';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
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
        LeadsBulkCreateComponent,
        LeadsCreateComponent,
        LeadsListComponent,
        LeadsEditComponent,
    ],
    imports: [
        ToolbarModule,
        TableModule,
        CheckboxModule,
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
        LeadsRoutingModule,
    ],
})
export class LeadsModule {}
