import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BankRoutingModule } from './bank-routing.module';
import { BankCreateComponent } from './bank-create/bank-create.component';
import { BankEditComponent } from './bank-edit/bank-edit.component';
import { BankListComponent } from './bank-list/bank-list.component';
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
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { ConfirmPopupModule } from 'primeng/confirmpopup';

@NgModule({
    declarations: [BankCreateComponent, BankEditComponent, BankListComponent],
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
        BankRoutingModule,
        MessageModule,
        MessagesModule,
        ConfirmPopupModule,
    ],
})
export class BankModule {}
