import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ChipsModule } from 'primeng/chips';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';

import { ReportMailRoutingModule } from './report-mail-routing.module';
import { ReportMailSettingsComponent } from './report-mail-settings/report-mail-settings.component';

@NgModule({
    declarations: [ReportMailSettingsComponent],
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        ChipsModule,
        DropdownModule,
        InputSwitchModule,
        TableModule,
        ToastModule,
        ToolbarModule,
        ReportMailRoutingModule,
    ],
})
export class ReportMailModule {}
