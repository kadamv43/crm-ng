import { TestBed } from '@angular/core/testing';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { HttpParams } from '@angular/common/http';
import { ContactsService } from './contacts.service';
import { environment } from 'src/environments/environment';

describe('ContactsService', () => {
    let service: ContactsService;
    let http: HttpTestingController;
    const base = environment.baseUrl + 'contacts';

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
        service = TestBed.inject(ContactsService);
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => http.verify());

    it('asks for the unique lead count', () => {
        let result: any;
        service.stats().subscribe((r) => (result = r));
        const req = http.expectOne(base + '/stats');
        expect(req.request.method).toBe('GET');
        req.flush({ total_unique_leads: 42 });
        expect(result.total_unique_leads).toBe(42);
    });

    it('passes the company when superadmin picks one', () => {
        service.stats(new HttpParams().set('branch', 'B1')).subscribe();
        const req = http.expectOne((r) => r.url === base + '/stats');
        expect(req.request.params.get('branch')).toBe('B1');
        req.flush({});
    });

    it('looks a number up with the number as a query parameter', () => {
        service.lookup('+91 9000000001').subscribe();
        const req = http.expectOne((r) => r.url === base + '/lookup');
        expect(req.request.params.get('mobile')).toBe('+91 9000000001');
        req.flush([]);
    });

    it('reads the activity of a contact', () => {
        service.activity('C1', new HttpParams().set('page', '1')).subscribe();
        const req = http.expectOne((r) => r.url === base + '/C1/activity');
        expect(req.request.params.get('page')).toBe('1');
        req.flush({ data: [], total: 0 });
    });
});
