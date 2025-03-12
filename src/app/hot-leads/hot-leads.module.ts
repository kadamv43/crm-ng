import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HotLeadsRoutingModule } from './hot-leads-routing.module';
import { HotLeadsBulkCreateComponent } from './hot-leads-bulk-create/hot-leads-bulk-create.component';
import { HotLeadsCreateComponent } from './hot-leads-create/hot-leads-create.component';
import { HotLeadsEditComponent } from './hot-leads-edit/hot-leads-edit.component';
import { HotLeadsListComponent } from './hot-leads-list/hot-leads-list.component';
import { ToolbarModule } from 'primeng/toolbar';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PanelModule } from 'primeng/panel';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToastModule } from 'primeng/toast';
import { EditorModule } from 'primeng/editor';
import { CheckboxModule } from 'primeng/checkbox';
import { AssignedHotLeadsComponent } from './assigned-hot-leads/assigned-hot-leads.component';

@NgModule({
    declarations: [
        HotLeadsBulkCreateComponent,
        HotLeadsCreateComponent,
        HotLeadsEditComponent,
        HotLeadsListComponent,
        AssignedHotLeadsComponent,
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
        FormsModule,
        CommonModule,
        HotLeadsRoutingModule,
    ],
})
export class HotLeadsModule {}
