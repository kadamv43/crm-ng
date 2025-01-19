import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaymentLinkListComponent } from './payment-link-list/payment-link-list.component';
import { PaymentLinkEditComponent } from './payment-link-edit/payment-link-edit.component';
import { PaymentLinkCreateComponent } from './payment-link-create/payment-link-create.component';

const routes: Routes = [
    { path: '', component: PaymentLinkListComponent },
    { path: 'edit/:id', component: PaymentLinkEditComponent },
    { path: 'create', component: PaymentLinkCreateComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PaymentLinkRoutingModule {}
