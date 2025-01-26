import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminListComponent } from './admin-list/admin-list.component';
import { AdminEditComponent } from './admin-edit/admin-edit.component';
import { AdminCreateComponent } from './admin-create/admin-create.component';

const routes: Routes = [
    { path: '', component: AdminListComponent },
    { path: 'edit/:id', component: AdminEditComponent },
    { path: 'create', component: AdminCreateComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AdminsRoutingModule {}
