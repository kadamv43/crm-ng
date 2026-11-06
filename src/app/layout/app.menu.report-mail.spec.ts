import { AppMenuComponent } from './app.menu.component';

// Who gets the Report Emails menu entry.
describe('menu: Report Emails', () => {
    const itemsFor = (role: string) => {
        localStorage.setItem('role', role);
        const menu = new AppMenuComponent({} as any);
        menu.ngOnInit();
        const labels: string[] = [];
        const routes: string[] = [];
        const walk = (items: any[]) =>
            items?.forEach((item) => {
                if (item.label) labels.push(item.label);
                if (item.routerLink) routes.push(item.routerLink.join('/'));
                if (item.items) walk(item.items);
            });
        walk(menu.model);
        return { labels, routes };
    };

    afterEach(() => localStorage.clear());

    it('admin has it, once, pointing at the page', () => {
        const { labels, routes } = itemsFor('admin');
        expect(labels.filter((l) => l === 'Report Emails').length).toBe(1);
        expect(routes).toContain('report-mail');
    });

    it('superadmin has it, once', () => {
        const { labels, routes } = itemsFor('superadmin');
        expect(labels.filter((l) => l === 'Report Emails').length).toBe(1);
        expect(routes).toContain('report-mail');
    });

    it('team leads and staff do not', () => {
        for (const role of ['teamlead', 'employee']) {
            const { labels, routes } = itemsFor(role);
            expect(labels).not.toContain('Report Emails');
            expect(routes).not.toContain('report-mail');
        }
    });

    it('the other entries are still there', () => {
        const { labels } = itemsFor('admin');
        expect(labels).toEqual(jasmine.arrayContaining(['Attendance', 'Employees']));
    });
});
