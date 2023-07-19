import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginComponent} from "./components/login/login.component";
import {AuthGuard} from "./guards/auth.guard";
import {OrdineClienteComponent} from "./components/ordine-cliente/ordine-cliente-list/ordine-cliente.component";
import {ArticoloComponent} from "./components/ordine-cliente/articolo/articolo.component";
import {OafListComponent} from "./components/ordine-fornitore/oaf-list/oaf-list.component";
import {OafDettaglioComponent} from "./components/ordine-fornitore/oaf-dettaglio/oaf-dettaglio.component";
import {ResetPasswordComponent} from "./components/reset-password/reset-password.component";
import { UserDetailComponent } from './components/users/user-detail/user-detail.component';
import {UserListComponent} from "./components/users/user-list/user-list.component";
import {RoleComponent} from "./components/role/role.component";
import {ListaComponent} from "./components/ordine-cliente/logistica/lista/lista.component";

const routes: Routes = [
  {
    path: 'users',
    canActivate: [AuthGuard],
    component: UserListComponent
  },
  {
    path: 'users-detail/:id',
    canActivate: [AuthGuard],
    component: UserDetailComponent
  },
  {
    path: 'users-detail',
    canActivate: [AuthGuard],
    component: UserDetailComponent
  },
  {
    path: 'role',
    canActivate: [AuthGuard],
    component: RoleComponent
  },
  {
    path: 'ordini-clienti',
    canActivate: [AuthGuard],
    component: OrdineClienteComponent,
  },
  {
    path: 'logistica-ordini',
    canActivate: [AuthGuard],
    component: ListaComponent,
  },
  {
    path: 'ordini-clienti/:status',
    canActivate: [AuthGuard],
    component: OrdineClienteComponent,
  },
  {
    path: 'ordini-fornitore/:status',
    canActivate: [AuthGuard],
    component: OafListComponent,
  },
  {
    path: 'ordini-fornitore',
    canActivate: [AuthGuard],
    component: OafListComponent,
  },
  {
    path: 'articoli/edit/:anno/:serie/:progressivo/:status',
    canActivate: [AuthGuard],
    component: ArticoloComponent,
  },
  {
    path: 'articoli/view/:anno/:serie/:progressivo/:status',
    canActivate: [AuthGuard],
    component: ArticoloComponent,
  },
  {
    path: 'oaf/articoli/:anno/:serie/:progressivo/:status',
    canActivate: [AuthGuard],
    component: OafDettaglioComponent,
  },
  {
    path: 'oaf/articoli/:anno/:serie/:progressivo',
    canActivate: [AuthGuard],
    component: OafDettaglioComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
