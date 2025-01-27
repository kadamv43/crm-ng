import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MonthlyIncentiveListComponent } from './monthly-incentive-list/monthly-incentive-list.component';
import { MonthlyIncentiveEditComponent } from './monthly-incentive-edit/monthly-incentive-edit.component';
import { MonthlyIncentiveCreateComponent } from './monthly-incentive-create/monthly-incentive-create.component';

const routes: Routes = [
    { path: '', component: MonthlyIncentiveListComponent },
    { path: 'edit/:id', component: MonthlyIncentiveEditComponent },
    { path: 'create', component: MonthlyIncentiveCreateComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class MonthlyIncentiveRoutingModule {}
