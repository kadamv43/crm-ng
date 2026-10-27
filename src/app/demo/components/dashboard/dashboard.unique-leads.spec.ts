import { of, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { CommonService } from 'src/app/services/common/common.service';

// Only the unique-leads figure is exercised here; the rest of the dashboard
// needs its full layout.
describe('DashboardComponent unique leads', () => {
    let component: any;
    let contacts: jasmine.SpyObj<any>;

    function make(role: string, selectedCompany = '') {
        contacts = jasmine.createSpyObj('ContactsService', ['stats']);
        contacts.stats.and.returnValue(of({ total_unique_leads: 7 }));
        component = Object.create(DashboardComponent.prototype);
        component.role = role;
        component.selectedCompany = selectedCompany;
        component.contactsService = contacts;
        component.commonService = new CommonService();
        component.uniqueLeads = null;
    }

    const sentParams = () => contacts.stats.calls.mostRecent().args[0];

    it('admin sees their company figure without choosing a company', () => {
        make('admin', 'ignored');
        component.getUniqueLeads();
        expect(component.uniqueLeads).toBe(7);
        expect(sentParams().has('branch')).toBeFalse();
    });

    it('superadmin asks for the company selected in the dropdown', () => {
        make('superadmin', 'CB');
        component.getUniqueLeads();
        expect(component.uniqueLeads).toBe(7);
        expect(sentParams().get('branch')).toBe('CB');
    });

    it('superadmin with no company chosen yet asks for the overall figure', () => {
        make('superadmin', '');
        component.getUniqueLeads();
        expect(sentParams().has('branch')).toBeFalse();
    });

    it('team leads and employees do not get the figure at all', () => {
        for (const role of ['teamlead', 'employee']) {
            make(role);
            component.uniqueLeads = 5;
            component.getUniqueLeads();
            expect(contacts.stats).not.toHaveBeenCalled();
            expect(component.uniqueLeads).toBeNull();
        }
    });

    it('a zero count is shown as 0, not hidden', () => {
        make('admin');
        contacts.stats.and.returnValue(of({ total_unique_leads: 0 }));
        component.getUniqueLeads();
        expect(component.uniqueLeads).toBe(0);
    });

    it('hides the figure if the request fails', () => {
        make('admin');
        component.uniqueLeads = 9;
        contacts.stats.and.returnValue(throwError(() => ({ status: 500 })));
        component.getUniqueLeads();
        expect(component.uniqueLeads).toBeNull();
    });
});
