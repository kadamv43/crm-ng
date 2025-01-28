import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeadsListComponent } from './leads-list/leads-list.component';
import { LeadsEditComponent } from './leads-edit/leads-edit.component';
import { LeadsCreateComponent } from './leads-create/leads-create.component';
import { LeadsBulkCreateComponent } from './leads-bulk-create/leads-bulk-create.component';
import { MyLeadsComponent } from './my-leads/my-leads.component';
import { ExpectedPaymentComponent } from './expected-payment/expected-payment.component';
import { FollowUpLeadsComponent } from './follow-up-leads/follow-up-leads.component';

const routes: Routes = [
    { path: '', component: LeadsListComponent },
    { path: 'edit/:id', component: LeadsEditComponent },
    { path: 'create', component: LeadsCreateComponent },
    { path: 'create/bulk', component: LeadsBulkCreateComponent },
    { path: 'my-leads', component: MyLeadsComponent },
    { path: 'follow-up', component: FollowUpLeadsComponent },
    { path: 'expected-payment', component: ExpectedPaymentComponent },
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class LeadsRoutingModule {}
