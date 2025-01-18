import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppointmentsRoutingModule } from './appointments-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { RatingModule } from 'primeng/rating';
import { ButtonModule } from 'primeng/button';
import { SliderModule } from 'primeng/slider';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { RippleModule } from 'primeng/ripple';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { AppointmentListComponent } from './appointment-list/appointment-list.component';
import { ToolbarModule } from 'primeng/toolbar';
import { AppointmentCreateComponent } from './appointment-create/appointment-create.component';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CalendarModule } from 'primeng/calendar';
import { ChipsModule } from 'primeng/chips';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { CascadeSelect, CascadeSelectModule } from 'primeng/cascadeselect';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { PanelModule } from 'primeng/panel';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { AppointmentEditComponent } from './appointment-edit/appointment-edit.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { FileUploadModule } from 'primeng/fileupload';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { FileUploadFormComponent } from './file-upload-form/file-upload-form.component';
import { ChipModule } from 'primeng/chip';
import { ReportsComponent } from './reports/reports.component';
import { PreviewInvoiceComponent } from './preview-invoice/preview-invoice.component';
import { DialogModule } from 'primeng/dialog';
import { NgxPrintModule } from 'ngx-print';
import { CheckboxModule } from 'primeng/checkbox';
import { UploadReportsComponent } from './upload-reports/upload-reports.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

@NgModule({
    declarations: [
        AppointmentListComponent,
        AppointmentCreateComponent,
        AppointmentEditComponent,
        InvoiceComponent,
        PreviewInvoiceComponent,
        FileUploadFormComponent,
        UploadReportsComponent,
        ReportsComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ToolbarModule,
        FileUploadModule,
        RatingModule,
        ButtonModule,
        SliderModule,
        DialogModule,
        InputTextModule,
        ToggleButtonModule,
        RippleModule,
        DropdownModule,
        ProgressBarModule,
        ToastModule,
        AutoCompleteModule,
        CalendarModule,
        ChipsModule,
        InputMaskModule,
        InputNumberModule,
        CascadeSelectModule,
        MultiSelectModule,
        InputTextareaModule,
        InputTextModule,
        ReactiveFormsModule,
        AppointmentsRoutingModule,
        PanelModule,
        ConfirmPopupModule,
        MessageModule,
        MessagesModule,
        ChipsModule,
        ChipModule,
        DynamicDialogModule,
        NgxPrintModule,
        CheckboxModule,
        NgxExtendedPdfViewerModule,
    ],
})
export class AppointmentsModule {}
