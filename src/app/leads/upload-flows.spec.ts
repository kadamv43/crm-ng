import { fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';

import { LeadsBulkCreateComponent } from './leads-bulk-create/leads-bulk-create.component';
import { LeadsCreateComponent } from './leads-create/leads-create.component';
import { HotLeadsBulkCreateComponent } from '../hot-leads/hot-leads-bulk-create/hot-leads-bulk-create.component';
import { HotLeadsCreateComponent } from '../hot-leads/hot-leads-create/hot-leads-create.component';

// What the user is told after an upload / paste-assign, and whether the page
// moves on, for each of the four places numbers enter the system.
describe('upload screens', () => {
    const toast: any = { add: null };
    let router: jasmine.SpyObj<any>;

    beforeEach(() => {
        toast.add = jasmine.createSpy('add');
        router = jasmine.createSpyObj('Router', ['navigateByUrl']);
    });

    const shown = () => toast.add.calls.mostRecent().args[0];

    const goodReply = {
        added: 940,
        message: '940 added, 700 new contacts, 260 already known',
    };
    const nothingReply = {
        added: 0,
        message: '0 added, 0 new contacts, 5 already known, 5 already waiting in the pool (skipped)',
    };

    describe('normal leads Excel upload', () => {
        function make(reply: any) {
            const service: any = { importExcel: jasmine.createSpy().and.returnValue(of(reply)) };
            const c = new LeadsBulkCreateComponent(service, toast, router, new FormBuilder());
            c.selectedFile = new File(['x'], 'leads.xlsx');
            c.form.patchValue({ file: 'leads.xlsx' });
            return { c, service };
        }

        it('reports the counts and goes back to the list after a moment', fakeAsync(() => {
            const { c, service } = make(goodReply);
            c.submit();
            expect(service.importExcel).toHaveBeenCalledTimes(1);
            expect(shown().severity).toBe('success');
            expect(shown().detail).toBe(goodReply.message);
            expect(router.navigateByUrl).not.toHaveBeenCalled();
            tick(2000);
            expect(router.navigateByUrl).toHaveBeenCalledWith('leads');
        }));

        it('warns and stays on the page when nothing could be added', fakeAsync(() => {
            const { c } = make(nothingReply);
            c.submit();
            tick(5000);
            expect(shown().severity).toBe('warn');
            expect(shown().detail).toContain('already waiting in the pool');
            expect(router.navigateByUrl).not.toHaveBeenCalled();
        }));

        it('sends nothing without a file', fakeAsync(() => {
            const service: any = { importExcel: jasmine.createSpy() };
            const c = new LeadsBulkCreateComponent(service, toast, router, new FormBuilder());
            c.submit();
            expect(service.importExcel).not.toHaveBeenCalled();
            expect(toast.add).not.toHaveBeenCalled();
        }));
    });

    describe('hot leads Excel upload', () => {
        function make(reply: any) {
            const service: any = { importExcel: jasmine.createSpy().and.returnValue(of(reply)) };
            const c = new HotLeadsBulkCreateComponent(service, toast, router, new FormBuilder());
            c.selectedFile = new File(['x'], 'hot.xlsx');
            c.form.patchValue({ file: 'hot.xlsx' });
            return c;
        }

        it('reports the counts and goes back to the list', fakeAsync(() => {
            make(goodReply).submit();
            expect(shown().severity).toBe('success');
            tick(2000);
            expect(router.navigateByUrl).toHaveBeenCalledWith('hot-leads');
        }));

        it('warns and stays when everything was skipped', fakeAsync(() => {
            make(nothingReply).submit();
            tick(5000);
            expect(shown().severity).toBe('warn');
            expect(router.navigateByUrl).not.toHaveBeenCalled();
        }));
    });

    describe('single hot lead form', () => {
        function make(reply: any) {
            const service: any = { create: jasmine.createSpy().and.returnValue(of(reply)) };
            const c = new HotLeadsCreateComponent(service, toast, router, new FormBuilder());
            c.form.patchValue({ mobile: '9000000001', name: 'A', city: 'B', investment: '100' });
            return { c, service };
        }

        it('confirms a new hot lead and returns to the list', fakeAsync(() => {
            const { c, service } = make({ added: 1, message: '1 added, 1 new contacts, 0 already known' });
            c.submit();
            expect(service.create).toHaveBeenCalledTimes(1);
            expect(shown().severity).toBe('success');
            tick(2000);
            expect(router.navigateByUrl).toHaveBeenCalledWith('hot-leads');
        }));

        it('tells the user when the number is already waiting instead of claiming it was created', fakeAsync(() => {
            const { c } = make({
                added: 0,
                message: '0 added, 0 new contacts, 1 already known, 1 already waiting in the pool (skipped)',
            });
            c.submit();
            tick(5000);
            expect(shown().severity).toBe('warn');
            expect(shown().detail).toContain('already waiting');
            expect(router.navigateByUrl).not.toHaveBeenCalled();
        }));
    });

    describe('paste numbers and assign to a staff member', () => {
        function make(reply: any) {
            const userLeads: any = { create: jasmine.createSpy().and.returnValue(of(reply)) };
            const c = new LeadsCreateComponent(
                {} as any,
                userLeads,
                {} as any,
                {} as any,
                toast,
                router,
                new FormBuilder()
            );
            c.form.patchValue({ mobile: '9000000001\n9000000002', user: 'staff1' });
            return { c, userLeads };
        }

        it('shows what was assigned and clears the form', () => {
            const { c, userLeads } = make({
                assigned: 2,
                invalid: 1,
                invalid_mobiles: ['abc'],
                message: '2 assigned, 1 new contacts, 1 already known, 1 invalid numbers (skipped)',
            });
            c.submit();
            expect(userLeads.create).toHaveBeenCalledWith({
                mobile: '9000000001\n9000000002',
                user: 'staff1',
            });
            expect(shown().severity).toBe('success');
            expect(shown().detail).toContain('2 assigned');
            expect(shown().detail).toContain('Invalid: abc');
            expect(c.form.value.mobile).toBeFalsy();
        });

        it('warns when no valid number was in the list', () => {
            const { c } = make({
                assigned: 0,
                invalid: 2,
                invalid_mobiles: ['x', 'y'],
                message: '0 assigned, 0 new contacts, 0 already known, 2 invalid numbers (skipped)',
            });
            c.submit();
            expect(shown().severity).toBe('warn');
        });

        it('does not send an empty form', () => {
            const { c, userLeads } = make({ assigned: 1 });
            c.form.patchValue({ mobile: '', user: '' });
            c.submit();
            expect(userLeads.create).not.toHaveBeenCalled();
        });
    });
});
