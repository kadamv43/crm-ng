import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';

import { CampaignsRoutingModule } from './campaigns-routing.module';
import { CampaignListComponent } from './campaign-list/campaign-list.component';

@NgModule({
    declarations: [CampaignListComponent],
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        ConfirmDialogModule,
        DialogModule,
        DropdownModule,
        InputNumberModule,
        InputTextModule,
        MultiSelectModule,
        TableModule,
        TagModule,
        ToastModule,
        ToolbarModule,
        CampaignsRoutingModule,
    ],
})
export class CampaignsModule {}
