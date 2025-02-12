import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChangePasswordRoutingModule } from './change-password-routing.module';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';

@NgModule({
    declarations: [ChangePasswordComponent],
    imports: [
        ReactiveFormsModule,
        MessageModule,
        MessagesModule,
        PasswordModule,
        ButtonModule,
        DialogModule,
        InputTextModule,
        CommonModule,
        ToastModule,
        ChangePasswordRoutingModule,
    ],
})
export class ChangePasswordModule {}
