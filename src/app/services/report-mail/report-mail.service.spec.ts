import { TestBed } from '@angular/core/testing';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { ReportMailService } from './report-mail.service';
import { environment } from 'src/environments/environment';

describe('ReportMailService', () => {
    let service: ReportMailService;
    let http: HttpTestingController;
    const base = environment.baseUrl + 'report-mail';

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
        service = TestBed.inject(ReportMailService);
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => http.verify());

    it('reads the settings of the logged-in user\'s own company', () => {
        service.getSettings().subscribe();
        const req = http.expectOne(base + '/settings');
        expect(req.request.method).toBe('GET');
        req.flush({});
    });

    it('superadmin names the company', () => {
        service.getSettings('B1').subscribe();
        http.expectOne(base + '/settings?branch=B1').flush({});
        service.getLogs('B1').subscribe();
        http.expectOne(base + '/logs?branch=B1').flush([]);
        service.saveSettings({ enabled: false }, 'B1').subscribe();
        http.expectOne(base + '/settings?branch=B1').flush({});
        service.sendTest('B1').subscribe();
        http.expectOne(base + '/test?branch=B1').flush({});
    });

    it('saves with PUT and sends exactly the settings given', () => {
        const settings = {
            enabled: true,
            recipients: ['a@x.com'],
            from_hour: 9,
            to_hour: 23,
            only_logged_in: false,
            skip_if_unchanged: true,
        };
        service.saveSettings(settings).subscribe();
        const req = http.expectOne(base + '/settings');
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(settings);
        req.flush({});
    });

    it('sends the test with POST', () => {
        service.sendTest().subscribe();
        const req = http.expectOne(base + '/test');
        expect(req.request.method).toBe('POST');
        req.flush({ sent_to: [] });
    });

    it('reads the history', () => {
        service.getLogs().subscribe();
        const req = http.expectOne(base + '/logs');
        expect(req.request.method).toBe('GET');
        req.flush([]);
    });

    it('a company id is safe to put in the address', () => {
        service.getSettings('a b&c=d').subscribe();
        http.expectOne(base + '/settings?branch=a%20b%26c%3Dd').flush({});
    });
});
