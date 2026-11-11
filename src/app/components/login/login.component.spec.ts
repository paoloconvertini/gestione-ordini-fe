import { of } from 'rxjs';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  it('dopo il login apre la dashboard', () => {
    const router = jasmine.createSpyObj('Router', ['navigate']);
    const auth = jasmine.createSpyObj('AuthService', ['login']);
    auth.login.and.returnValue(of({}));
    const component = new LoginComponent(auth, router, {} as any);
    component.form.setValue({ username: 'test' as any, password: 'test' as any });
    component.submitForm();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    component.ngOnDestroy();
  });
});
