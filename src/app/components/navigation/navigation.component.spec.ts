import { Subject } from 'rxjs';
import { NavigationEnd } from '@angular/router';
import { NavigationComponent } from './navigation.component';

describe('NavigationComponent', () => {
  let component: NavigationComponent;
  let breakpoints: Subject<any>;
  let events: Subject<any>;
  beforeEach(() => {
    localStorage.removeItem('navigation.collapsed');
    breakpoints = new Subject();
    events = new Subject();
    component = new NavigationComponent({getCurrentUser: () => ({username: 'Anna'})} as any,
      {} as any, {observe: () => breakpoints} as any, {events} as any);
  });
  afterEach(() => { component.ngOnDestroy(); localStorage.removeItem('navigation.collapsed'); });
  it('memorizza la chiusura desktop e consente di riaprire il menu', () => {
    breakpoints.next({matches: false});
    component.toggleMenu();
    expect(component.menuOpen).toBeFalse();
    expect(localStorage.getItem('navigation.collapsed')).toBe('true');
    component.toggleMenu();
    expect(component.menuOpen).toBeTrue();
  });
  it('su mobile chiude il menu dopo la navigazione senza cambiare la preferenza desktop', () => {
    breakpoints.next({matches: true});
    expect(component.menuOpen).toBeFalse();
    component.toggleMenu();
    events.next(new NavigationEnd(1, '/dashboard', '/dashboard'));
    expect(component.menuOpen).toBeFalse();
    expect(localStorage.getItem('navigation.collapsed')).toBeNull();
  });
});
