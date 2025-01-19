import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UpiListComponent } from './upi-list/upi-list.component';
import { UpiEditComponent } from './upi-edit/upi-edit.component';
import { UpiCreateComponent } from './upi-create/upi-create.component';

const routes: Routes = [
    { path: '', component: UpiListComponent },
    { path: 'edit/:id', component: UpiEditComponent },
    { path: 'create', component: UpiCreateComponent },
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class UpiRoutingModule {}
