import {TemplateRef, ViewContainerRef} from '@angular/core';
import {HasPermDirective} from './has-perm.directive';
import {AuthService} from '../services/auth/auth.service';

describe('HasPermDirective', () => {
  let directive: HasPermDirective;
  let template: TemplateRef<any>;
  let container: jasmine.SpyObj<ViewContainerRef>;
  let auth: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    template = {} as TemplateRef<any>;
    container = jasmine.createSpyObj('ViewContainerRef', ['clear', 'createEmbeddedView']);
    auth = jasmine.createSpyObj('AuthService', ['hasPerm']);
    directive = new HasPermDirective(template, container, auth);
  });

  it('mostra il contenuto quando il permesso è concesso', () => {
    auth.hasPerm.and.returnValue(true);
    directive.hasPerm = 'ordini_clienti.view';
    expect(auth.hasPerm).toHaveBeenCalledWith('ordini_clienti.view');
    expect(container.createEmbeddedView).toHaveBeenCalledOnceWith(template);
  });

  it('non mostra il contenuto quando il permesso è negato', () => {
    auth.hasPerm.and.returnValue(false);
    directive.hasPerm = 'ordini_clienti.view';
    expect(container.clear).toHaveBeenCalledTimes(1);
    expect(container.createEmbeddedView).not.toHaveBeenCalled();
  });

  it('rimuove il contenuto precedente quando il nuovo permesso è negato', () => {
    auth.hasPerm.and.returnValues(true, false);
    directive.hasPerm = 'ordini_clienti.view';
    container.clear.calls.reset();
    container.createEmbeddedView.calls.reset();
    directive.hasPerm = 'users.view';
    expect(auth.hasPerm).toHaveBeenCalledWith('users.view');
    expect(container.clear).toHaveBeenCalledTimes(1);
    expect(container.createEmbeddedView).not.toHaveBeenCalled();
  });

  it('svuota il contenuto senza interrogare i permessi quando il valore è vuoto', () => {
    directive.hasPerm = '';
    expect(container.clear).toHaveBeenCalledTimes(1);
    expect(auth.hasPerm).not.toHaveBeenCalled();
    expect(container.createEmbeddedView).not.toHaveBeenCalled();
  });
});
