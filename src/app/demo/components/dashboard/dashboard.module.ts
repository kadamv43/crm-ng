import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard.component';
import { ChartModule } from 'primeng/chart';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { StyleClassModule } from 'primeng/styleclass';
import { PanelMenuModule } from 'primeng/panelmenu';
import { DashboardsRoutingModule } from './dashboard-routing.module';
import { PendingInvoiceComponent } from './pending-invoice/pending-invoice.component';
import { ToolbarModule } from 'primeng/toolbar';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ChartModule,
        MenuModule,
        TableModule,
        ToolbarModule,
        StyleClassModule,
        PanelMenuModule,
        DropdownModule,
        ChartModule,
        ButtonModule,
        ToastModule,
        CalendarModule,
        InputTextModule,
        InputSwitchModule,
        DashboardsRoutingModule,
    ],
    declarations: [PendingInvoiceComponent, DashboardComponent],
})
export class DashboardModule {}
