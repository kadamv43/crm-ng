import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SpotIncentiveRoutingModule } from './spot-incentive-routing.module';
import { SpotIncentiveCreateComponent } from './spot-incentive-create/spot-incentive-create.component';
import { SpotIncentiveEditComponent } from './spot-incentive-edit/spot-incentive-edit.component';
import { SpotIncentiveListComponent } from './spot-incentive-list/spot-incentive-list.component';
import { ToolbarModule } from 'primeng/toolbar';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ReactiveFormsModule } from '@angular/forms';
import { PanelModule } from 'primeng/panel';
import { ToastModule } from 'primeng/toast';

@NgModule({
    declarations: [
        SpotIncentiveCreateComponent,
        SpotIncentiveEditComponent,
        SpotIncentiveListComponent,
    ],
    imports: [
        ToolbarModule,
        TableModule,
        InputTextModule,
        ButtonModule,
        ReactiveFormsModule,
        PanelModule,
        ToastModule,
        CommonModule,
        SpotIncentiveRoutingModule,
    ],
})
export class SpotIncentiveModule {}
