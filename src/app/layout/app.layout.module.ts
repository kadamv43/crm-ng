import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InputTextModule } from 'primeng/inputtext';
import { SidebarModule } from 'primeng/sidebar';
import { BadgeModule } from 'primeng/badge';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputSwitchModule } from 'primeng/inputswitch';
import { RippleModule } from 'primeng/ripple';
import { AppMenuComponent } from './app.menu.component';
import { AppMenuitemComponent } from './app.menuitem.component';
import { RouterModule } from '@angular/router';
import { AppTopBarComponent } from './app.topbar.component';
import { AppFooterComponent } from './app.footer.component';
import { AppConfigModule } from './config/config.module';
import { AppSidebarComponent } from './app.sidebar.component';
import { AppLayoutComponent } from './app.layout.component';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { NotepadComponent } from './notepad/notepad.component';
import { EditorModule } from 'primeng/editor';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';
import { UpdateModalComponent } from './update-modal/update-modal.component';
import { MobileHistoryComponent } from './mobile-history/mobile-history.component';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { SwitchPopupComponent } from './switch-popup/switch-popup.component';


@NgModule({
    declarations: [
        AppMenuitemComponent,
        AppTopBarComponent,
        AppFooterComponent,
        AppMenuComponent,
        AppSidebarComponent,
        AppLayoutComponent,
        NotepadComponent,
        SwitchPopupComponent,
        UpdateModalComponent,
        MobileHistoryComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        InputTextModule,
        SidebarModule,
        ToastModule,
        BadgeModule,
        RadioButtonModule,
        InputSwitchModule,
        RippleModule,
        RouterModule,
        AppConfigModule,
        OverlayPanelModule,
        EditorModule,
        ProgressBarModule,
        ButtonModule,
        ReactiveFormsModule,
        TableModule,
        DialogModule
    ],
    exports: [AppLayoutComponent],
})
export class AppLayoutModule {}
