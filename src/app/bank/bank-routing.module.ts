import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BankListComponent } from './bank-list/bank-list.component';
import { BankEditComponent } from './bank-edit/bank-edit.component';
import { BankCreateComponent } from './bank-create/bank-create.component';

const routes: Routes = [
    { path: '', component: BankListComponent },
    { path: 'edit/:id', component: BankEditComponent },
    { path: 'create', component: BankCreateComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class BankRoutingModule {}
