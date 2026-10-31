import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

import { ReportMailSettingsComponent } from './report-mail-settings.component';
import { ReportMailModule } from '../report-mail.module';
import { ReportMailService } from 'src/app/services/report-mail/report-mail.service';
import { BranchesService } from 'src/app/services/branches/branches.service';
import { AuthService } from 'src/app/services/auth.service';

// answers arrive later, as real HTTP responses do
const respond = (value: any) => of(value).pipe(delay(0));
const pause = (ms = 20) => new Promise((r) => setTimeout(r, ms));

const saved = {
    saved: true,
    enabled: true,
    recipients: ['boss@x.com', 'owner@x.com'],
    from_hour: 9,
    to_hour: 23,
    only_logged_in: false,
    skip_if_unchanged: false,
    last_sent_at: '2025-03-10T08:30:00Z', // 2:00 PM in India
    last_status: 'SENT',
    last_error: null,
};
const logs = [
    { slot: '2025-03-10 15', status: 'FAILED', recipients_count: 2, error: '535 Authentication failed' },
    { slot: '2025-03-10 14', status: 'SENT', recipients_count: 2 },
];

describe('ReportMailSettingsComponent', () => {
    let fixture: ComponentFixture<ReportMailSettingsComponent>;
    let component: any;
    let api: jasmine.SpyObj<ReportMailService>;
    let toast: jasmine.Spy;

    async function setup(role = 'admin', settings: any = saved, logRows: any[] = logs) {
        api = jasmine.createSpyObj('ReportMailService', ['getSettings', 'saveSettings', 'sendTest', 'getLogs']);
        api.getSettings.and.callFake((() => respond(settings)) as any);
        api.getLogs.and.callFake((() => respond(logRows)) as any);
        api.saveSettings.and.callFake(((body: any) => respond({ ...saved, ...body, saved: true })) as any);
        api.sendTest.and.callFake((() => respond({ sent_to: ['boss@x.com', 'owner@x.com'], subject: '[TEST] x' })) as any);
        const branches = jasmine.createSpyObj('BranchesService', ['getAll']);
        branches.getAll.and.callFake((() => respond({ data: [{ name: 'Co A', _id: 'CA' }, { name: 'Co B', _id: 'CB' }] })) as any);

        await TestBed.configureTestingModule({
            imports: [ReportMailModule, NoopAnimationsModule],
            providers: [
                { provide: ReportMailService, useValue: api },
                { provide: BranchesService, useValue: branches },
                { provide: AuthService, useValue: { getRole: () => role } },
                { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
                { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ReportMailSettingsComponent);
        component = fixture.componentInstance;
        // watch the component's own toast service
        toast = spyOn(fixture.debugElement.injector.get(MessageService), 'add');
        fixture.detectChanges();
        await pause();
        fixture.detectChanges();
        await fixture.whenStable(); // form controls take their values in a later step
        fixture.detectChanges();
    }

    const text = () => fixture.nativeElement.textContent.replace(/\s+/g, ' ');
    const button = (label: string): HTMLButtonElement =>
        Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button')).find((b) => b.textContent.trim().includes(label));
    const lastToast = () => toast.calls.mostRecent().args[0];

    // ---------------------------------------------------------------- loading
    describe('opening the page', () => {
        beforeEach(() => setup());

        it('an admin loads their own company\'s settings and history, without naming a company', () => {
            expect(api.getSettings).toHaveBeenCalledOnceWith(undefined);
            expect(api.getLogs).toHaveBeenCalledOnceWith(undefined);
            expect(component.ready).toBeTrue();
        });

        it('shows what was saved', () => {
            expect(component.model).toEqual({
                enabled: true, recipients: ['boss@x.com', 'owner@x.com'], from_hour: 9, to_hour: 23,
                only_logged_in: false, skip_if_unchanged: false,
            });
            expect(text()).toContain('Send the hourly email');
            expect(text()).toContain('(2 added)');
            expect(fixture.nativeElement.textContent).toContain('boss@x.com');
        });

        it('has no company picker', () => {
            expect(fixture.nativeElement.querySelector('#company')).toBeNull();
        });

        it('explains that hours are India time', () => {
            expect(text()).toContain('Hours are India time.');
        });

        it('shows the last email and when it went, in India time', () => {
            expect(text()).toContain('Last email: 10 Mar, 2:00 PM - SENT');
        });

        it('lists the recent emails with their problem', () => {
            const rows = fixture.nativeElement.querySelectorAll('tbody tr');
            expect(rows.length).toBe(2);
            const first = rows[0].textContent.replace(/\s+/g, ' ');
            expect(first).toContain('10 Mar, 3:00 PM');
            expect(first).toContain('FAILED');
            expect(first).toContain('535 Authentication failed');
            expect(rows[1].textContent).toContain('10 Mar, 2:00 PM');
        });

        it('offers the 24 hours with 12-hour labels', () => {
            expect(component.hours.length).toBe(24);
            expect(component.hours[0]).toEqual({ value: 0, label: '12:00 AM' });
            expect(component.hours[9]).toEqual({ value: 9, label: '9:00 AM' });
            expect(component.hours[12]).toEqual({ value: 12, label: '12:00 PM' });
            expect(component.hours[23]).toEqual({ value: 23, label: '11:00 PM' });
        });
    });

    describe('first time (nothing saved yet)', () => {
        it('shows the defaults, with the admin\'s address ready, and says it is not saved', async () => {
            await setup('admin', {
                saved: false, enabled: false, recipients: ['admin@x.com'], from_hour: 9, to_hour: 23,
                only_logged_in: false, skip_if_unchanged: false, last_sent_at: null, last_status: null, last_error: null,
            }, []);
            expect(component.model.recipients).toEqual(['admin@x.com']);
            expect(component.model.enabled).toBeFalse();
            expect(text()).toContain('Not saved yet. Save to turn this on.');
            expect(text()).not.toContain('Last email:');
            expect(text()).toContain('No emails sent yet.');
            expect(component.canTest).toBeFalse(); // nothing saved to test
        });
    });

    // ---------------------------------------------------------------- editing
    describe('editing', () => {
        beforeEach(() => setup());

        it('is not dirty until something changes, and Save stays disabled', () => {
            expect(component.dirty).toBeFalse();
            expect(button('Save').disabled).toBeTrue();
        });

        it('any change makes it dirty and enables Save; changing back is clean again', () => {
            component.model.skip_if_unchanged = true;
            fixture.detectChanges();
            expect(component.dirty).toBeTrue();
            expect(button('Save').disabled).toBeFalse();
            expect(text()).toContain('You have unsaved changes.');

            component.model.skip_if_unchanged = false;
            fixture.detectChanges();
            expect(component.dirty).toBeFalse();
        });

        it('adding or removing an address is a change', () => {
            component.model.recipients = [...component.model.recipients, 'new@x.com'];
            expect(component.dirty).toBeTrue();
            component.model.recipients = ['boss@x.com', 'owner@x.com'];
            expect(component.dirty).toBeFalse();
        });
    });

    describe('typing addresses', () => {
        beforeEach(() => setup('admin', { ...saved, recipients: ['boss@x.com'] }));

        const add = (typed: string) => {
            component.model.recipients = [...component.model.recipients, typed]; // what the chips box does
            component.onAddRecipient({ value: typed });
        };

        it('keeps a good address, tidied: trimmed and lower case', () => {
            add('  New.Person@Example.COM ');
            expect(component.model.recipients).toEqual(['boss@x.com', 'new.person@example.com']);
        });

        it('throws out something that is not an address and says why', () => {
            add('not-an-email');
            expect(component.model.recipients).toEqual(['boss@x.com']);
            expect(lastToast().detail).toContain('"not-an-email" is not a valid email address.');
            expect(lastToast().severity).toBe('warn');
        });

        for (const bad of ['a@', '@x.com', 'a b@x.com', 'a@x', 'a@x.c', '']) {
            it(`refuses "${bad}"`, () => {
                add(bad);
                expect(component.model.recipients).toEqual(['boss@x.com']);
            });
        }

        it('does not add the same address twice, whatever its case', () => {
            add('BOSS@x.com');
            expect(component.model.recipients).toEqual(['boss@x.com']);
        });

        it('a very long address is refused', () => {
            add('x'.repeat(250) + '@x.com');
            expect(component.model.recipients).toEqual(['boss@x.com']);
        });
    });

    // ----------------------------------------------------------------- saving
    describe('saving', () => {
        beforeEach(() => setup());

        it('sends exactly what is on the screen and then shows the saved state', async () => {
            component.model.skip_if_unchanged = true;
            component.model.to_hour = 20;
            component.save();
            expect(api.saveSettings).toHaveBeenCalledOnceWith(
                { enabled: true, recipients: ['boss@x.com', 'owner@x.com'], from_hour: 9, to_hour: 20, only_logged_in: false, skip_if_unchanged: true },
                undefined
            );
            expect(component.saving).toBeTrue();
            await pause();
            fixture.detectChanges();
            expect(component.saving).toBeFalse();
            expect(component.dirty).toBeFalse();
            expect(lastToast()).toEqual(jasmine.objectContaining({ severity: 'success', summary: 'Saved', detail: 'The hourly email is on.' }));
        });

        it('says when it was saved switched off', async () => {
            component.model.enabled = false;
            component.save();
            await pause();
            expect(lastToast().detail).toBe('Saved. The hourly email is off.');
        });

        it('will not switch it on without an address (no request is made)', () => {
            component.model.recipients = [];
            component.save();
            expect(api.saveSettings).not.toHaveBeenCalled();
            expect(lastToast().detail).toContain('Add at least one email address');
        });

        it('may be saved off with no addresses', async () => {
            component.model.enabled = false;
            component.model.recipients = [];
            component.save();
            expect(api.saveSettings).toHaveBeenCalledTimes(1);
            await pause();
        });

        it('will not send a first hour after the last hour', () => {
            component.model.from_hour = 20;
            component.model.to_hour = 10;
            component.save();
            expect(api.saveSettings).not.toHaveBeenCalled();
            expect(lastToast().detail).toContain('must not be after');
        });

        it('one hour (first equals last) is fine', async () => {
            component.model.from_hour = 12;
            component.model.to_hour = 12;
            component.save();
            expect(api.saveSettings).toHaveBeenCalledTimes(1);
            await pause();
        });

        it('too many addresses is caught before asking the server', () => {
            component.model.recipients = Array.from({ length: 11 }, (_, i) => `p${i}@x.com`);
            component.save();
            expect(api.saveSettings).not.toHaveBeenCalled();
            expect(lastToast().detail).toContain('At most 10');
        });

        it('shows the server\'s reason when it refuses, and stays editable', async () => {
            api.saveSettings.and.returnValue(throwError(() => ({ status: 400, error: { message: '"x" is not a valid email address' } })) as any);
            component.model.skip_if_unchanged = true;
            component.save();
            expect(component.saving).toBeFalse();
            expect(lastToast()).toEqual(jasmine.objectContaining({ severity: 'error', summary: 'Could not save', detail: '"x" is not a valid email address' }));
            expect(component.dirty).toBeTrue(); // nothing was lost
        });

        it('copes with a list of messages from the server', () => {
            api.saveSettings.and.returnValue(throwError(() => ({ error: { message: ['one', 'two'] } })) as any);
            component.model.skip_if_unchanged = true;
            component.save();
            expect(lastToast().detail).toBe('one, two');
        });
    });

    // ---------------------------------------------------------------- testing
    describe('Send test email now', () => {
        beforeEach(() => setup());

        it('is available when everything is saved and there is someone to send to', () => {
            expect(component.canTest).toBeTrue();
            expect(button('Send test email now').disabled).toBeFalse();
        });

        it('is not available with unsaved changes (the test goes to the saved addresses)', () => {
            component.model.skip_if_unchanged = true;
            fixture.detectChanges();
            expect(component.canTest).toBeFalse();
            expect(button('Send test email now').disabled).toBeTrue();
            component.sendTest();
            expect(api.sendTest).not.toHaveBeenCalled();
            expect(lastToast().summary).toBe('Save first');
        });

        it('is not available when every address was removed', () => {
            component.model.recipients = [];
            expect(component.canTest).toBeFalse();
        });

        it('sends, says to how many people, and refreshes the status', async () => {
            api.getSettings.calls.reset();
            component.sendTest();
            expect(component.testing).toBeTrue();
            expect(component.canTest).toBeFalse(); // no second click while sending
            await pause();
            fixture.detectChanges();
            expect(api.sendTest).toHaveBeenCalledOnceWith(undefined);
            expect(lastToast()).toEqual(jasmine.objectContaining({ severity: 'success', summary: 'Test email sent', detail: 'Sent to 2 addresses.' }));
            expect(component.testing).toBeFalse();
            expect(api.getSettings).toHaveBeenCalledTimes(1); // status and history reloaded
        });

        it('says "address" for one person', async () => {
            api.sendTest.and.callFake((() => respond({ sent_to: ['boss@x.com'] })) as any);
            component.sendTest();
            await pause();
            expect(lastToast().detail).toBe('Sent to 1 address.');
        });

        it('shows the mail server\'s reason when it fails, and refreshes so the failure shows under Last email', async () => {
            api.sendTest.and.returnValue(throwError(() => ({ status: 502, error: { message: 'The email could not be sent: 535 Authentication failed' } })) as any);
            api.getSettings.calls.reset();
            component.sendTest();
            expect(component.testing).toBeFalse();
            expect(lastToast()).toEqual(jasmine.objectContaining({ severity: 'error', summary: 'The test email could not be sent', detail: 'The email could not be sent: 535 Authentication failed' }));
            expect(api.getSettings).toHaveBeenCalledTimes(1);
        });

        it('shows the button as "Sending..." while it works', async () => {
            component.sendTest();
            fixture.detectChanges();
            expect(button('Sending...')).toBeTruthy();
            await pause();
        });
    });

    // ---------------------------------------------------------------- display
    describe('status area', () => {
        it('a failed last email is spelled out in red with the reason', async () => {
            await setup('admin', { ...saved, last_status: 'FAILED', last_error: '535 Authentication failed' });
            expect(text()).toContain('Last email: 10 Mar, 2:00 PM - FAILED');
            expect(fixture.nativeElement.querySelector('.text-red-500.font-bold').textContent).toContain('FAILED');
            expect(text()).toContain('535 Authentication failed');
        });

        it('a skipped hour is shown as skipped', async () => {
            await setup('admin', { ...saved, last_status: 'SKIPPED' });
            expect(text()).toContain('- SKIPPED');
        });

        it('turning on the switches is part of the form', async () => {
            await setup('admin', { ...saved, only_logged_in: true, skip_if_unchanged: true });
            expect(component.model.only_logged_in).toBeTrue();
            expect(component.model.skip_if_unchanged).toBeTrue();
            expect(fixture.nativeElement.querySelectorAll('p-inputswitch').length).toBe(3);
        });
    });

    describe('formatting helpers', () => {
        beforeEach(() => setup());

        it('hour labels', () => {
            expect(component.hourLabel(0)).toBe('12:00 AM');
            expect(component.hourLabel(11)).toBe('11:00 AM');
            expect(component.hourLabel(12)).toBe('12:00 PM');
            expect(component.hourLabel(13)).toBe('1:00 PM');
            expect(component.hourLabel(23)).toBe('11:00 PM');
        });

        it('hour slots from the server', () => {
            expect(component.slotLabel('2025-03-10 14')).toBe('10 Mar, 2:00 PM');
            expect(component.slotLabel('2025-12-31 00')).toBe('31 Dec, 12:00 AM');
        });

        it('a slot it cannot read is shown as it came', () => {
            expect(component.slotLabel('weird')).toBe('weird');
            expect(component.slotLabel('')).toBe('');
            expect(component.slotLabel(undefined)).toBe('');
        });
    });

    describe('loading problems', () => {
        it('tells the user instead of staying blank when the settings cannot be loaded', async () => {
            api = jasmine.createSpyObj('ReportMailService', ['getSettings', 'saveSettings', 'sendTest', 'getLogs']);
            api.getSettings.and.returnValue(throwError(() => ({ status: 500, error: { message: 'boom' } })) as any);
            api.getLogs.and.returnValue(of([]) as any);
            await TestBed.configureTestingModule({
                imports: [ReportMailModule, NoopAnimationsModule],
                providers: [
                    { provide: ReportMailService, useValue: api },
                    { provide: BranchesService, useValue: {} },
                    { provide: AuthService, useValue: { getRole: () => 'admin' } },
                    { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
                    { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
                ],
            }).compileComponents();
            fixture = TestBed.createComponent(ReportMailSettingsComponent);
            component = fixture.componentInstance;
            const spy = spyOn(fixture.debugElement.injector.get(MessageService), 'add');
            fixture.detectChanges();
            await pause();
            expect(component.ready).toBeFalse();
            expect(spy.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({ severity: 'error', summary: 'Could not load the settings', detail: 'boom' }));
        });
    });

    // -------------------------------------------------------------- superadmin
    describe('as superadmin', () => {
        beforeEach(() => setup('superadmin'));

        it('picks the first company and loads that company', () => {
            expect(component.selectedCompany).toBe('CA');
            expect(api.getSettings).toHaveBeenCalledOnceWith('CA');
            expect(api.getLogs).toHaveBeenCalledOnceWith('CA');
            expect(fixture.nativeElement.querySelector('#company')).toBeTruthy();
        });

        it('switching company loads the other company', async () => {
            api.getSettings.calls.reset();
            api.getLogs.calls.reset();
            component.selectedCompany = 'CB';
            component.onCompanyChange();
            await pause();
            expect(api.getSettings).toHaveBeenCalledOnceWith('CB');
            expect(api.getLogs).toHaveBeenCalledOnceWith('CB');
        });

        it('save and test are for the chosen company', async () => {
            component.selectedCompany = 'CB';
            component.model.skip_if_unchanged = true;
            component.save();
            expect(api.saveSettings.calls.mostRecent().args[1]).toBe('CB');
            await pause();
            component.sendTest();
            expect(api.sendTest).toHaveBeenCalledWith('CB');
            await pause();
        });

        it('does not ask for anything until a company is chosen', () => {
            api.getSettings.calls.reset();
            component.selectedCompany = '';
            component.load();
            expect(api.getSettings).not.toHaveBeenCalled();
        });
    });
});
