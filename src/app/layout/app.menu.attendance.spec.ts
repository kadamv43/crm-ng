import { AppMenuComponent } from './app.menu.component';

// Who gets the Attendance menu entry.
describe('menu: Attendance', () => {
    const labelsFor = (role: string) => {
        localStorage.setItem('role', role);
        const menu = new AppMenuComponent({} as any);
        menu.ngOnInit();
        const labels: string[] = [];
        const walk = (items: any[]) =>
            items?.forEach((item) => {
                if (item.label) labels.push(item.label);
                if (item.items) walk(item.items);
            });
        walk(menu.model);
        const routes: string[] = [];
        const walkRoutes = (items: any[]) =>
            items?.forEach((item) => {
                if (item.routerLink) routes.push(item.routerLink.join('/'));
                if (item.items) walkRoutes(item.items);
            });
        walkRoutes(menu.model);
        return { labels, routes };
    };

    afterEach(() => localStorage.clear());

    it('admin has it, once, pointing at the attendance page', () => {
        const { labels, routes } = labelsFor('admin');
        expect(labels.filter((l) => l === 'Attendance').length).toBe(1);
        expect(routes).toContain('attendance');
    });

    it('superadmin has it, once', () => {
        const { labels, routes } = labelsFor('superadmin');
        expect(labels.filter((l) => l === 'Attendance').length).toBe(1);
        expect(routes).toContain('attendance');
    });

    it('team leads and staff do not', () => {
        for (const role of ['teamlead', 'employee']) {
            const { labels, routes } = labelsFor(role);
            expect(labels).not.toContain('Attendance');
            expect(routes).not.toContain('attendance');
        }
    });
});
