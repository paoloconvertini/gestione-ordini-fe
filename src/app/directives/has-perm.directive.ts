import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

@Directive({
  selector: '[hasPerm]' // uso: *hasPerm="'ordine.modifica'"
})
export class HasPermDirective {

  private permission: string | null = null;

  constructor(
    private tpl: TemplateRef<any>,
    private vcr: ViewContainerRef,
    private auth: AuthService
  ) {}

  @Input()
  set hasPerm(perm: string) {
    this.permission = perm;
    this.updateView();
  }

  private updateView() {
    this.vcr.clear();

    if (!this.permission) return;

    if (this.auth.hasPerm(this.permission)) {
      this.vcr.createEmbeddedView(this.tpl);
    }
  }
}
