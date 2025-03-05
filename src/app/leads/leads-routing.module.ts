import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeadsListComponent } from './leads-list/leads-list.component';
import { LeadsEditComponent } from './leads-edit/leads-edit.component';
import { LeadsCreateComponent } from './leads-create/leads-create.component';
import { LeadsBulkCreateComponent } from './leads-bulk-create/leads-bulk-create.component';
import { MyLeadsComponent } from './my-leads/my-leads.component';
import { ExpectedPaymentComponent } from './expected-payment/expected-payment.component';
import { FollowUpLeadsComponent } from './follow-up-leads/follow-up-leads.component';
import { MyHotLeadsComponent } from './my-hot-leads/my-hot-leads.component';
import { AssignedHotLeadsComponent } from './assigned-hot-leads/assigned-hot-leads.component';
import { AssignedLeadsComponent } from './assigned-leads/assigned-leads.component';

const routes: Routes = [
    { path: '', component: LeadsListComponent },
    { path: 'edit/:id', component: LeadsEditComponent },
    { path: 'create', component: LeadsCreateComponent },
    { path: 'create/bulk', component: LeadsBulkCreateComponent },
    { path: 'my-leads', component: MyLeadsComponent },
    { path: 'my-hot-leads', component: MyHotLeadsComponent },
    { path: 'follow-up', component: FollowUpLeadsComponent },
    { path: 'expected-payment', component: ExpectedPaymentComponent },
    { path: 'assigned-leads', component: AssignedLeadsComponent },
    { path: 'assigned-hot-leads', component: AssignedHotLeadsComponent },
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class LeadsRoutingModule {}
