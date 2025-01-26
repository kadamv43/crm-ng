import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeadsListComponent } from './leads-list/leads-list.component';
import { LeadsEditComponent } from './leads-edit/leads-edit.component';
import { LeadsCreateComponent } from './leads-create/leads-create.component';
import { LeadsBulkCreateComponent } from './leads-bulk-create/leads-bulk-create.component';

const routes: Routes = [
    { path: '', component: LeadsListComponent },
    { path: 'edit/:id', component: LeadsEditComponent },
    { path: 'create', component: LeadsCreateComponent },
    { path: 'create/bulk', component: LeadsBulkCreateComponent },
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class LeadsRoutingModule {}
