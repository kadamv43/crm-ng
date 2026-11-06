import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { AttendanceListComponent } from './attendance-list.component';
import { AttendanceModule } from '../attendance.module';
import { AttendanceService } from 'src/app/services/attendance/attendance.service';
import { AuthService } from 'src/app/services/auth.service';
import { BranchesService } from 'src/app/services/branches/branches.service';

const delayed = (value: any) => of(value);

const ROWS = [
    {
        _id: 'a1',
        user: { username: 'asha', first_name: 'Asha', last_name: 'K', role: 'employee' },
        // 02:35 UTC is 8:05 AM in India
        first_login_at: '2025-03-10T02:35:00Z',
        last_login_at: '2025-03-10T12:30:00Z', // 6:00 PM in India
        login_count: 3,
    },
    {
        _id: 'a2',
        user: { username: 'ravi', first_name: 'Ravi', last_name: '', role: 'teamlead' },
        first_login_at: '2025-03-10T03:00:00Z',
        last_login_at: '2025-03-10T03:00:00Z',
        login_count: 1,
    },
];

describe('AttendanceListComponent', () => {
    let fixture: ComponentFixture<AttendanceListComponent>;
    let component: AttendanceListComponent;
    let attendance: jasmine.SpyObj<AttendanceService>;
    let branches: jasmine.SpyObj<BranchesService>;

    const sent = (call = -1) => {
        const calls = attendance.getAll.calls.all();
        const p = (call < 0 ? calls[calls.length + call] : calls[call]).args[0];
        const out: any = {};
        p?.keys().forEach((k) => (out[k] = p.get(k)));
        return out;
    };

    async function setup(role: string, reply: any = { date: '2025-03-10', data: ROWS, total: 2 }) {
        attendance = jasmine.createSpyObj('AttendanceService', ['getAll']);
        attendance.getAll.and.returnValue(delayed(reply) as any);
        branches = jasmine.createSpyObj('BranchesService', ['getAll']);
        branches.getAll.and.returnValue(
            delayed({ data: [{ name: 'Co A', _id: 'CA' }, { name: 'Co B', _id: 'CB' }] }) as any
        );
        await TestBed.configureTestingModule({
            imports: [AttendanceModule, NoopAnimationsModule],
            providers: [
                { provide: AttendanceService, useValue: attendance },
                { provide: BranchesService, useValue: branches },
                { provide: AuthService, useValue: { getRole: () => role } },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(AttendanceListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    const text = () => fixture.nativeElement.textContent.replace(/\s+/g, ' ');

    describe('as admin', () => {
        beforeEach(() => setup('admin'));

        it('loads the current attendance day without sending a date or a company', () => {
            expect(attendance.getAll).toHaveBeenCalledTimes(1);
            expect(sent()).toEqual({});
        });

        it('shows the day the server answered for in the date picker', () => {
            expect(component.toYmd(component.selectedDate)).toBe('2025-03-10');
        });

        it('lists everyone who logged in with their name, role and times in India time', () => {
            const rows = fixture.nativeElement.querySelectorAll('tbody tr');
            expect(rows.length).toBe(2);
            const first = rows[0].textContent.replace(/\s+/g, ' ');
            expect(first).toContain('Asha K');
            expect(first).toContain('asha');
            expect(first).toContain('employee');
            expect(first).toContain('08:05 AM'); // first login
            expect(first).toContain('06:00 PM'); // last login
            expect(rows[0].querySelectorAll('td')[6].textContent.trim()).toBe('3');
            expect(rows[1].textContent).toContain('Ravi');
        });

        it('shows the total', () => {
            expect(text()).toContain('Total logged in: 2');
        });

        it('has no company picker', () => {
            expect(fixture.nativeElement.querySelector('#company')).toBeNull();
        });

        it('choosing another day asks for that day, formatted as yyyy-MM-dd', () => {
            component.selectedDate = new Date(2025, 0, 5);
            component.onDateChange();
            expect(sent().date).toBe('2025-01-05');
        });
    });

    describe('empty and failing', () => {
        it('says so when nobody logged in', async () => {
            await setup('admin', { date: '2025-03-10', data: [], total: 0 });
            expect(text()).toContain('Nobody logged in on this day.');
            expect(text()).toContain('Total logged in: 0');
        });

        it('shows an empty list instead of stale rows when the request fails', async () => {
            await setup('admin');
            attendance.getAll.and.returnValue(throwError(() => ({ status: 500 })) as any);
            component.selectedDate = new Date(2025, 0, 5);
            component.onDateChange();
            expect(component.rows).toEqual([]);
            expect(component.total).toBe(0);
            expect(component.loading).toBeFalse();
        });
    });

    describe('as superadmin', () => {
        beforeEach(() => setup('superadmin'));

        it('picks the first company and asks for it', () => {
            expect(component.selectedCompany).toBe('CA');
            expect(sent().branch).toBe('CA');
            expect(attendance.getAll).toHaveBeenCalledTimes(1);
        });

        it('switching company reloads for that company', () => {
            component.selectedCompany = 'CB';
            component.onCompanyChange();
            expect(sent().branch).toBe('CB');
        });

        it('sends both company and date', () => {
            component.selectedDate = new Date(2025, 1, 9);
            component.selectedCompany = 'CB';
            component.load();
            expect(sent()).toEqual({ date: '2025-02-09', branch: 'CB' });
        });

        it('does not ask for attendance until a company is known', () => {
            attendance.getAll.calls.reset();
            component.selectedCompany = '';
            component.load();
            expect(attendance.getAll).not.toHaveBeenCalled();
            expect(component.rows).toEqual([]);
        });
    });

    describe('helpers', () => {
        beforeEach(() => setup('admin'));

        it('formats and parses days without shifting them (no time zone slip)', () => {
            for (const text of ['2025-01-01', '2025-03-10', '2025-12-31', '2024-02-29']) {
                expect(component.toYmd(component.fromYmd(text))).toBe(text);
            }
        });

        it('builds the name from whatever parts exist', () => {
            expect(component.fullName({ user: { first_name: 'A', last_name: 'B' } })).toBe('A B');
            expect(component.fullName({ user: { first_name: 'A' } })).toBe('A');
            expect(component.fullName({})).toBe('');
        });
    });
});
