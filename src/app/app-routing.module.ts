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
import {BoxDocciaComponent} from "./components/box-doccia/box-doccia.component";
import { AmmortamentoComponent } from './components/cespite/ammortamenti/ammortamento.component';
import {RiservatoMagazzinoComponent} from "./components/riservato-magazzino/riservato-magazzino.component";
import {CespiteComponent} from "./components/cespite/cespite/cespite.component";
import {PrimanotaComponent} from "./components/primanota/primanota.component";
import {TipoCespiteListComponent} from "./components/tipo-cespite/tipo-cespite-list/tipo-cespite-list.component";
import {TipoCespiteDetailComponent} from "./components/tipo-cespite/tipo-cespite-detail/tipo-cespite-detail.component";
import {OafMonitorComponent} from "./components/ordine-fornitore/oaf-monitor/oaf-monitor.component";
import {ListaCarichiComponent} from "./components/lista-carichi/lista-carichi.component";
import {ListaCarichiDettaglioComponent} from "./components/lista-carichi-dettaglio/lista-carichi-dettaglio.component";
import {DepositoComponent} from "./components/deposito/deposito.component";
import {ListaCarichiInviatiComponent} from "./components/lista-carichi-inviati/lista-carichi-inviati.component";
import {ConsegneSettimanaliComponent} from "./components/consegne-settimanali/consegne-settimanali.component";
import {CollegaOAFComponent} from "./components/collega-oaf/collega-oaf.component";
import {PermissionListComponent} from "./components/permissions/permission-list/permission-list.component";

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
    path: 'permissions',
    canActivate: [AuthGuard],
    component: PermissionListComponent
  },
  {
    path: 'ordini-clienti',
    canActivate: [AuthGuard],
    component: OrdineClienteComponent,
  },
  {
    path: 'articoli/edit/:anno/:serie/:progressivo',
    canActivate: [AuthGuard],
    component: ArticoloComponent,
  },
  {
    path: 'articoli/view/:anno/:serie/:progressivo',
    canActivate: [AuthGuard],
    component: ArticoloComponent,
  },
  {
    path: 'logistica-ordini',
    canActivate: [AuthGuard],
    component: ListaComponent,
  },
  {
    path: 'consegne-settimanali',
    canActivate: [AuthGuard],
    component: ConsegneSettimanaliComponent,
  },
  {
    path: 'ordini-fornitore',
    canActivate: [AuthGuard],
    component: OafListComponent,
  },
  {
    path: 'oaf-monitor',
    canActivate: [AuthGuard],
    component: OafMonitorComponent,
  },
  {
    path: 'oaf/articoli/:mode/:anno/:serie/:progressivo',
    canActivate: [AuthGuard],
    component: OafDettaglioComponent,
  },
  {
    path: 'collega-oaf/:progrGenerale/:page/:size/:anno/:serie/:progressivo/:status',
    canActivate: [AuthGuard],
    component: CollegaOAFComponent,
  },
  {
    path: 'box-doccia',
    canActivate: [AuthGuard],
    component: BoxDocciaComponent,
  },
  {
    path: ':param/ammortamenti',
    canActivate: [AuthGuard],
    component: AmmortamentoComponent,
  },
  {
    path: ':param/cespiti',
    canActivate: [AuthGuard],
    component: CespiteComponent,
  },
  {
    path: ':param/primanota',
    canActivate: [AuthGuard],
    component: PrimanotaComponent,
  },
  {
    path: ':param/tipo-cespiti',
    canActivate: [AuthGuard],
    component: TipoCespiteListComponent,
  },
  {
    path: ':param/tipo-cespiti-detail/:id',
    canActivate: [AuthGuard],
    component: TipoCespiteDetailComponent,
  },
  {
    path: ':param/tipo-cespiti-detail',
    canActivate: [AuthGuard],
    component: TipoCespiteDetailComponent,
  },
  {
    path: 'riserve',
    canActivate: [AuthGuard],
    component: RiservatoMagazzinoComponent,
  },
  {
    path: 'carico-detail/edit/:id',
    canActivate: [AuthGuard],
    component: ListaCarichiDettaglioComponent,
  },
  {
    path: 'depositi',
    canActivate: [AuthGuard],
    component: DepositoComponent,
  },
  {
    path: 'lista-carichi',
    canActivate: [AuthGuard],
    component: ListaCarichiComponent,
  },
  {
    path: 'lista-carichi-inviata',
    canActivate: [AuthGuard],
    component: ListaCarichiInviatiComponent,
  },
  {
    path: 'carico-detail',
    canActivate: [AuthGuard],
    component: ListaCarichiDettaglioComponent,
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
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled', // Add options right here
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
