import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MonthlyIncentiveRoutingModule } from './monthly-incentive-routing.module';
import { MonthlyIncentiveCreateComponent } from './monthly-incentive-create/monthly-incentive-create.component';
import { MonthlyIncentiveListComponent } from './monthly-incentive-list/monthly-incentive-list.component';
import { MonthlyIncentiveEditComponent } from './monthly-incentive-edit/monthly-incentive-edit.component';
import { ToolbarModule } from 'primeng/toolbar';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { ReactiveFormsModule } from '@angular/forms';
import { PanelModule } from 'primeng/panel';
import { ToastModule } from 'primeng/toast';

@NgModule({
    declarations: [
        MonthlyIncentiveCreateComponent,
        MonthlyIncentiveListComponent,
        MonthlyIncentiveEditComponent,
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
        MonthlyIncentiveRoutingModule,
    ],
})
export class MonthlyIncentiveModule {}
