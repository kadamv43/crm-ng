import { Component } from '@angular/core';
import { NetworkService } from 'src/app/services/network/network.service';

@Component({
    selector: 'app-switch-popup',
    templateUrl: './switch-popup.component.html',
    styleUrl: './switch-popup.component.scss',
})
export class SwitchPopupComponent {
    constructor(public network: NetworkService) {}

    get formattedTime(): string {
        const minutes = Math.floor(this.network.countdown / 60);
        const seconds = this.network.countdown % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
}
