import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DayOfferListComponent } from './day-offer-list/day-offer-list.component';
import { DayOfferEditComponent } from './day-offer-edit/day-offer-edit.component';
import { DayOfferCreateComponent } from './day-offer-create/day-offer-create.component';

const routes: Routes = [
    { path: '', component: DayOfferListComponent },
    { path: 'edit/:id', component: DayOfferEditComponent },
    { path: 'create', component: DayOfferCreateComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class DayOfferRoutingModule {}
