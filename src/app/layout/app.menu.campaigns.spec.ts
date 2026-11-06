import { AppMenuComponent } from './app.menu.component';

// Who gets the Campaigns menu entry.
describe('menu: Campaigns', () => {
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

    it('admin and superadmin have it, once, pointing at the page', () => {
        for (const role of ['admin', 'superadmin']) {
            const { labels, routes } = itemsFor(role);
            expect(labels.filter((l) => l === 'Campaigns').length).toBe(1);
            expect(routes).toContain('campaigns');
        }
    });

    it('team leads and staff do not', () => {
        for (const role of ['teamlead', 'employee']) {
            const { labels, routes } = itemsFor(role);
            expect(labels).not.toContain('Campaigns');
            expect(routes).not.toContain('campaigns');
        }
    });
});
