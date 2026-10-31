import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CampaignsService } from './campaigns.service';
import { environment } from 'src/environments/environment';

describe('CampaignsService', () => {
    let service: CampaignsService;
    let http: HttpTestingController;
    const base = environment.baseUrl + 'campaigns';

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
        service = TestBed.inject(CampaignsService);
        http = TestBed.inject(HttpTestingController);
    });
    afterEach(() => http.verify());

    it('lists, and reads the staff, of the own company', () => {
        service.list().subscribe();
        expect(http.expectOne(base).request.method).toBe('GET');
        service.staff().subscribe();
        http.expectOne(base + '/staff').flush([]);
    });

    it('superadmin names the company on every call', () => {
        service.list('B1').subscribe();
        http.expectOne(base + '?branch=B1').flush([]);
        service.staff('B1').subscribe();
        http.expectOne(base + '/staff?branch=B1').flush([]);
        service.detail('c1', 'B1').subscribe();
        http.expectOne(base + '/c1?branch=B1').flush({});
        service.create({ name: 'n', staff: ['a', 'b'], count: 5 }, 'B1').subscribe();
        http.expectOne(base + '?branch=B1').flush({});
        service.nextRound('c1', 'B1').subscribe();
        http.expectOne(base + '/c1/next-round?branch=B1').flush({});
        service.close('c1', 'B1').subscribe();
        http.expectOne(base + '/c1/close?branch=B1').flush({});
    });

    it('creates with POST and sends exactly what was given', () => {
        const body = { name: 'Diwali', staff: ['a', 'b'], count: 100 };
        service.create(body).subscribe();
        const req = http.expectOne(base);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(body);
        req.flush({});
    });

    it('next round and close are POSTs', () => {
        service.nextRound('c1').subscribe();
        const a = http.expectOne(base + '/c1/next-round');
        expect(a.request.method).toBe('POST');
        a.flush({});
        service.close('c1').subscribe();
        const b = http.expectOne(base + '/c1/close');
        expect(b.request.method).toBe('POST');
        b.flush({});
    });

    it('odd characters in an id or company are safe in the address', () => {
        service.detail('a/b', 'x y&z').subscribe();
        http.expectOne(base + '/a%2Fb?branch=x%20y%26z').flush({});
    });
});
