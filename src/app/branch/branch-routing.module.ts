import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BranchListComponent } from './branch-list/branch-list.component';
import { BranchEditComponent } from './branch-edit/branch-edit.component';
import { BranchCreateComponent } from './branch-create/branch-create.component';

const routes: Routes = [
    { path: '', component: BranchListComponent },
    { path: 'edit/:id', component: BranchEditComponent },
    { path: 'create', component: BranchCreateComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class BranchRoutingModule {}
