import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class NetworkService {
    private switchTimer: any;
  private currentStatus: boolean = true; // assume online initially

  // Dialog UI states
  public showDialog: boolean = false;
  public countdown: number = 0;
  public targetStatus: boolean = true; // online/offline target

  private readonly SWITCH_MINUTES = 3;
  private readonly SWITCH_SECONDS = this.SWITCH_MINUTES * 60;

  // Stabilization
  private lastStatus: boolean = true;
  private stableCounter: number = 0;
  private readonly STABLE_THRESHOLD = 3; // consecutive checks
  private readonly CHECK_INTERVAL = 5000; // 5 seconds

  constructor(private http: HttpService, private client: HttpClient) {
    this.initNetworkListener();
    this.startInternetCheck();
  }

  private initNetworkListener() {
    window.addEventListener('offline', () => this.startSwitch(false));
    window.addEventListener('online', () => this.startSwitch(true));
  }

  private startInternetCheck() {
    setInterval(async () => {
      const isConnected = await this.checkInternetConnection();

      if (isConnected === this.lastStatus) {
        this.stableCounter = 0;
      } else {
        this.stableCounter++;
        if (this.stableCounter >= this.STABLE_THRESHOLD) {
          this.startSwitch(isConnected);
          this.lastStatus = isConnected;
          this.stableCounter = 0;
        }
      }
    }, this.CHECK_INTERVAL);
  }

  private async checkInternetConnection(): Promise<boolean> {
    try {
      await this.client
        .get('https://www.google.com/favicon.ico', { responseType: 'text' })
        .toPromise();
      return true;
    } catch {
      return false;
    }
  }

  private startSwitch(status: boolean) {
    if (this.showDialog) {
      if (status) {
        // Net returned → immediate online switch
        clearTimeout(this.switchTimer);
        this.currentStatus = true;
        this.showDialog = false;
        this.http.setBaseUrl(environment.onlineApiUrl);
      }
      return;
    }

    // Start new countdown for offline
    this.showDialog = true;
    this.countdown = this.SWITCH_SECONDS;
    this.targetStatus = status;

    const intervalId = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) clearInterval(intervalId);
    }, 1000);

    this.switchTimer = setTimeout(() => {
      this.currentStatus = status;
      this.showDialog = false;

      if (status) {
        this.http.setBaseUrl(environment.onlineApiUrl);
      } else {
        this.http.setBaseUrl(environment.offlineApiUrl);
      }
    }, this.SWITCH_SECONDS * 1000);
  }

  // Dynamic upload path getter
  get currentUploadPath(): string {
    return this.currentStatus
      ? environment.onlineUploadPath
      : environment.offlineUploadPath;
  }
}
