import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BranchRoutingModule } from './branch-routing.module';
import { BranchEditComponent } from './branch-edit/branch-edit.component';
import { BranchCreateComponent } from './branch-create/branch-create.component';
import { BranchListComponent } from './branch-list/branch-list.component';
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
import { InputTextareaModule } from 'primeng/inputtextarea';
import { EditorModule } from 'primeng/editor';

@NgModule({
    declarations: [
        BranchEditComponent,
        BranchCreateComponent,
        BranchListComponent,
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
        InputTextareaModule,
        BranchRoutingModule,
    ],
})
export class BranchModule {}
