import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { of, throwError } from 'rxjs';

import { MobileHistoryComponent } from './mobile-history.component';
import { ContactsService } from 'src/app/services/contacts/contacts.service';
import { UserLeadsService } from 'src/app/services/user-leads/user-leads.service';
import { AuthService } from 'src/app/services/auth.service';

describe('MobileHistoryComponent', () => {
    let fixture: ComponentFixture<MobileHistoryComponent>;
    let contacts: jasmine.SpyObj<ContactsService>;

    const info = {
        contact: { mobile: '9000000001' },
        summary: {
            times_assigned: 3,
            times_worked: 5,
            last_status: 'DEAD',
            last_worked_by: { username: 'staff2' },
            last_worked_at: '2025-02-03T05:00:00Z',
        },
    };

    async function setup(lookup: any, mobile = '9000000001') {
        contacts = jasmine.createSpyObj('ContactsService', ['lookup']);
        contacts.lookup.and.returnValue(lookup);
        await TestBed.configureTestingModule({
            imports: [CommonModule],
            declarations: [MobileHistoryComponent],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                { provide: DynamicDialogConfig, useValue: { data: { mobile } } },
                { provide: DynamicDialogRef, useValue: {} },
                { provide: ContactsService, useValue: contacts },
                {
                    provide: UserLeadsService,
                    useValue: jasmine.createSpyObj('UserLeadsService', ['getLeadHistory']),
                },
                { provide: AuthService, useValue: { getRole: () => 'admin' } },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(MobileHistoryComponent);
        fixture.detectChanges();
    }

    it('shows how often the number was handed out and worked, and the last status and person', async () => {
        await setup(of([info]));
        const text: string = fixture.nativeElement.textContent.replace(/\s+/g, ' ');
        expect(contacts.lookup).toHaveBeenCalledWith('9000000001');
        expect(text).toContain('Handed out 3 time(s)');
        expect(text).toContain('Worked 5 time(s)');
        expect(text).toContain('Last status DEAD by staff2');
        expect(text).toContain('03-02-2025');
    });

    it('omits the last-status part for a number nobody has worked yet', async () => {
        await setup(
            of([
                {
                    ...info,
                    summary: {
                        times_assigned: 1,
                        times_worked: 0,
                        last_status: null,
                        last_worked_by: null,
                        last_worked_at: null,
                    },
                },
            ])
        );
        const text: string = fixture.nativeElement.textContent.replace(/\s+/g, ' ');
        expect(text).toContain('Handed out 1 time(s)');
        expect(text).not.toContain('Last status');
    });

    it('shows no banner for an unknown number', async () => {
        await setup(of([]));
        expect(fixture.nativeElement.textContent).not.toContain('Handed out');
    });

    it('still opens (no banner) if the lookup fails', async () => {
        await setup(throwError(() => ({ status: 500 })));
        expect(fixture.componentInstance.contactInfo).toBeNull();
        expect(fixture.nativeElement.textContent).not.toContain('Handed out');
    });

    it('does not look anything up without a number', async () => {
        await setup(of([]), '');
        expect(contacts.lookup).not.toHaveBeenCalled();
    });
});
