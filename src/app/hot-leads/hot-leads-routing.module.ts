import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HotLeadsListComponent } from './hot-leads-list/hot-leads-list.component';
import { HotLeadsEditComponent } from './hot-leads-edit/hot-leads-edit.component';
import { HotLeadsCreateComponent } from './hot-leads-create/hot-leads-create.component';
import { HotLeadsBulkCreateComponent } from './hot-leads-bulk-create/hot-leads-bulk-create.component';

const routes: Routes = [
    { path: '', component: HotLeadsListComponent },
    { path: 'edit/:id', component: HotLeadsEditComponent },
    { path: 'create', component: HotLeadsCreateComponent },
    { path: 'create/bulk', component: HotLeadsBulkCreateComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class HotLeadsRoutingModule {}
