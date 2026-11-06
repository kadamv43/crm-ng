import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';

import { AttendanceRoutingModule } from './attendance-routing.module';
import { AttendanceListComponent } from './attendance-list/attendance-list.component';

@NgModule({
    declarations: [AttendanceListComponent],
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ToolbarModule,
        CalendarModule,
        DropdownModule,
        AttendanceRoutingModule,
    ],
})
export class AttendanceModule {}
