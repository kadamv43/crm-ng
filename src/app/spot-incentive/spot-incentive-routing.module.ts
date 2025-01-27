import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SpotIncentiveListComponent } from './spot-incentive-list/spot-incentive-list.component';
import { SpotIncentiveEditComponent } from './spot-incentive-edit/spot-incentive-edit.component';
import { SpotIncentiveCreateComponent } from './spot-incentive-create/spot-incentive-create.component';

const routes: Routes = [
    { path: '', component: SpotIncentiveListComponent },
    { path: 'edit/:id', component: SpotIncentiveEditComponent },
    { path: 'create', component: SpotIncentiveCreateComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SpotIncentiveRoutingModule {}
