import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {

    // ----------------------------------------------------
    // 1️⃣ UTENTE NON LOGGATO O TOKEN SCADUTO
    // (isLogged controlla anche exp)
    // ----------------------------------------------------
    if (!this.auth.isLogged()) {
      this.auth.logout();  // pulizia + redirect
      return this.router.parseUrl('/login');
    }

    // ----------------------------------------------------
    // 2️⃣ CHECK PERMESSO SU ROUTE (opzionale)
    // route.data = { permission: 'ordine.modifica' }
    // ----------------------------------------------------
    const requiredPerm = route.data['permission'];

    if (requiredPerm && !this.auth.hasPerm(requiredPerm)) {
      // opzionale: una pagina 403
      console.warn("Accesso negato: manca permesso", requiredPerm);
      return this.router.parseUrl('/login');
    }

    // ----------------------------------------------------
    // 3️⃣ TUTTO OK → ACCESSO CONSENTITO
    // ----------------------------------------------------
    return true;
  }
}
