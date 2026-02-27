import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeUntil } from 'rxjs';
import { BaseComponent } from '../baseComponent';
import {OrdiniClientiStateService} from "../../services/state/ordini-clienti-state.service";
import {PermissionService} from "../../services/auth/permission.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent extends BaseComponent {

  form = new FormGroup({
    username: new FormControl(null, Validators.required),
    password: new FormControl(null, Validators.required),
  });

  hide: boolean = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackbar: MatSnackBar,
    private state: OrdiniClientiStateService,
    private perm: PermissionService
  ) {
    super();
  }

  submitForm(): void {
    if (!this.form.valid) return;

    this.authService.login({
      username: this.username.value,
      password: this.password.value
    })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: () => {
          // 0️⃣ SHOWROOM ONLY
          if (this.perm.canViewRegistroVisite
            && !this.perm.canViewOrdiniClienti
            && !this.perm.canViewOrdiniFornitori) {
            this.router.navigate(['/registro-visite']);
            return;
          }

          // 1️⃣ AMMINISTRATIVO → ordini-clienti con filtro preimpostato DA_ORDINARE
          if (this.perm.canRedirectAmministrativo) {
            this.state.setState({ filtroStatus: 'DA_ORDINARE', page: 0 });
            this.router.navigate(['/ordini-clienti']);
            return;
          }

          // 2️⃣ LOGISTICA → pagina logistica
          if (this.perm.canRedirectLogistica) {
            this.state.clearOnLogout(); // SOLO PER TEST
            this.router.navigate(['/gestione-consegne']);
            return;
          }


          // 3️⃣ DEFAULT → ordini-clienti (status rimane quello salvato o default “TUTTI”)
          if (this.perm.canRedirectDefault) {
            this.router.navigate(['/ordini-clienti']);
            return;
          }

          // Fallback (non succede mai)
          this.router.navigate(['/ordini-clienti']);
        },
        error: () => {
          this.snackbar.open('Credenziali non valide', 'Chiudi', {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      });
  }

  get username(): FormControl {
    return this.form.get('username') as FormControl;
  }

  get password(): FormControl {
    return this.form.get('password') as FormControl;
  }

  resetPassword(): void {
    this.router.navigate(['/reset-password']);
  }
}
