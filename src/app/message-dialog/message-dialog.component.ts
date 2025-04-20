import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
    selector: 'app-message-dialog',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './message-dialog.component.html',
    styleUrl: './message-dialog.component.scss',
})
export class MessageDialogComponent {
    message = '';
    messageType = '';
    constructor(public config: DynamicDialogConfig) {
        this.message = config.data.message;
        this.messageType = config.data.messageType;
    }
}
