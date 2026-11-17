import {AuthGuard} from './auth.guard';

describe('AuthGuard', () => {
  let auth: any;
  let router: any;
  let guard: AuthGuard;
  beforeEach(() => {
    auth = jasmine.createSpyObj('auth', ['isLogged','hasRole','hasPerm','logout']);
    auth.isLogged.and.returnValue(true);
    router = {parseUrl: (url: string) => url};
    guard = new AuthGuard(auth,router as any);
  });
  it('nega la pagina pagamenti a un utente senza ruolo Admin', () => {
    auth.hasRole.and.returnValue(false);
    expect(guard.canActivate({data: {role: 'Admin'}} as any,{} as any) as any).toBe('/dashboard');
  });
  it('consente la pagina pagamenti a un Admin', () => {
    auth.hasRole.and.returnValue(true);
    expect(guard.canActivate({data: {role: 'Admin'}} as any,{} as any)).toBeTrue();
  });
  it('continua a verificare login e permessi sulle altre pagine', () => {
    auth.isLogged.and.returnValue(false);
    expect(guard.canActivate({data: {}} as any,{} as any) as any).toBe('/login');
    expect(auth.logout).toHaveBeenCalled();
    auth.isLogged.and.returnValue(true); auth.hasPerm.and.returnValue(false);
    expect(guard.canActivate({data: {permission: 'test'}} as any,{} as any) as any).toBe('/login');
  });
});
