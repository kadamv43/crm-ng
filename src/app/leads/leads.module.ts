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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PanelModule } from 'primeng/panel';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToastModule } from 'primeng/toast';
import { EditorModule } from 'primeng/editor';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MyLeadsComponent } from './my-leads/my-leads.component';
import { FollowUpLeadsComponent } from './follow-up-leads/follow-up-leads.component';
import { ExpectedPaymentComponent } from './expected-payment/expected-payment.component';
import { FreeTrialFormComponent } from './free-trial-form/free-trial-form.component';
import { ExpectedPaymentFormComponent } from './expected-payment-form/expected-payment-form.component';
import { PaymentFormComponent } from './payment-form/payment-form.component';
import { CallbackFormComponent } from './callback-form/callback-form.component';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmationService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { MyHotLeadsComponent } from './my-hot-leads/my-hot-leads.component';

@NgModule({
    declarations: [
        LeadsBulkCreateComponent,
        LeadsCreateComponent,
        LeadsListComponent,
        MyLeadsComponent,
        LeadsEditComponent,
        FollowUpLeadsComponent,
        ExpectedPaymentComponent,
        FreeTrialFormComponent,
        ExpectedPaymentFormComponent,
        PaymentFormComponent,
        CallbackFormComponent,
        MyHotLeadsComponent,
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
        FormsModule,
        DropdownModule,
        MultiSelectModule,
        ToastModule,
        EditorModule,
        CommonModule,
        DialogModule,
        ConfirmPopupModule,
        // ConfirmationService,
        InputTextareaModule,
        LeadsRoutingModule,
    ],
})
export class LeadsModule {}
