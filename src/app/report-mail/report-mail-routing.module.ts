import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportMailSettingsComponent } from './report-mail-settings/report-mail-settings.component';

const routes: Routes = [{ path: '', component: ReportMailSettingsComponent }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ReportMailRoutingModule {}
