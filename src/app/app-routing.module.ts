import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from "./components/login/login.component";
import { AuthGuard } from "./guards/auth.guard";

import { OrdineClienteComponent } from "./components/ordine-cliente/ordine-cliente-list/ordine-cliente.component";
import { ArticoloComponent } from "./components/ordine-cliente/articolo/articolo.component";

import { OafListComponent } from "./components/ordine-fornitore/oaf-list/oaf-list.component";
import { OafDettaglioComponent } from "./components/ordine-fornitore/oaf-dettaglio/oaf-dettaglio.component";

import { ResetPasswordComponent } from "./components/reset-password/reset-password.component";

import { UserDetailComponent } from './components/users/user-detail/user-detail.component';
import { UserListComponent } from "./components/users/user-list/user-list.component";

import { RoleComponent } from "./components/role/role.component";
import { RolePermissionsComponent } from './components/permissions/role-permissions/role-permissions.component';

import { ListaComponent } from "./components/ordine-cliente/logistica/lista/lista.component";
import { BoxDocciaComponent } from "./components/box-doccia/box-doccia.component";
import { AmmortamentoComponent } from './components/cespite/ammortamenti/ammortamento.component';
import { RiservatoMagazzinoComponent } from "./components/riservato-magazzino/riservato-magazzino.component";
import { CespiteComponent } from "./components/cespite/cespite/cespite.component";
import { PrimanotaComponent } from "./components/primanota/primanota.component";
import { TipoCespiteListComponent } from "./components/tipo-cespite/tipo-cespite-list/tipo-cespite-list.component";
import { TipoCespiteDetailComponent } from "./components/tipo-cespite/tipo-cespite-detail/tipo-cespite-detail.component";
import { OafMonitorComponent } from "./components/ordine-fornitore/oaf-monitor/oaf-monitor.component";

import { ListaCarichiComponent } from "./components/lista-carichi/lista-carichi.component";
import { ListaCarichiDettaglioComponent } from "./components/lista-carichi-dettaglio/lista-carichi-dettaglio.component";
import { DepositoComponent } from "./components/deposito/deposito.component";
import { ListaCarichiInviatiComponent } from "./components/lista-carichi-inviati/lista-carichi-inviati.component";

import { ConsegneSettimanaliComponent } from "./components/consegne-settimanali/consegne-settimanali.component";
import { CollegaOAFComponent } from "./components/collega-oaf/collega-oaf.component";

const routes: Routes = [

  // ---------------------------------------------------
  // AUTENTICAZIONE
  // ---------------------------------------------------
  { path: 'login', component: LoginComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  // ---------------------------------------------------
  // USERS & ROLES
  // ---------------------------------------------------
  {
    path: 'users',
    canActivate: [AuthGuard],
    data: { permission: 'users.view' },
    component: UserListComponent
  },
  {
    path: 'users-detail/:id',
    canActivate: [AuthGuard],
    data: { permission: 'users.edit' },
    component: UserDetailComponent
  },
  {
    path: 'users-detail',
    canActivate: [AuthGuard],
    data: { permission: 'users.edit' },
    component: UserDetailComponent
  },

  {
    path: 'role',
    canActivate: [AuthGuard],
    data: { permission: 'roles.view' },
    component: RoleComponent
  },
  {
    path: 'role/:id/permissions',
    canActivate: [AuthGuard],
    data: { permission: 'permissions.manage' },
    component: RolePermissionsComponent
  },

  // ---------------------------------------------------
  // ORDINI CLIENTI
  // ---------------------------------------------------
  {
    path: 'ordini-clienti',
    canActivate: [AuthGuard],
    data: { permission: 'ordini.clienti.view' },
    component: OrdineClienteComponent
  },
  {
    path: 'ordini-clienti/:status/:page/:size',
    canActivate: [AuthGuard],
    data: { permission: 'ordini.clienti.view' },
    component: OrdineClienteComponent
  },
  {
    path: 'ordini-clienti/:page/:size',
    canActivate: [AuthGuard],
    data: { permission: 'ordini.clienti.view' },
    component: OrdineClienteComponent
  },

  {
    path: 'articoli/edit/:page/:size/:anno/:serie/:progressivo/:status',
    canActivate: [AuthGuard],
    data: { permission: 'ordini.clienti.edit' },
    component: ArticoloComponent
  },
  {
    path: 'articoli/view/:page/:size/:anno/:serie/:progressivo/:status',
    canActivate: [AuthGuard],
    data: { permission: 'ordini.clienti.view' },
    component: ArticoloComponent
  },

  // ---------------------------------------------------
  // ORDINI FORNITORI
  // ---------------------------------------------------
  {
    path: 'ordini-fornitore/:status',
    canActivate: [AuthGuard],
    data: { permission: 'ordini.fornitori.view' },
    component: OafListComponent
  },
  {
    path: 'ordini-fornitore',
    canActivate: [AuthGuard],
    data: { permission: 'ordini.fornitori.view' },
    component: OafListComponent
  },
  {
    path: 'oaf/articoli/:anno/:serie/:progressivo/:status',
    canActivate: [AuthGuard],
    data: { permission: 'ordini.fornitori.edit' },
    component: OafDettaglioComponent
  },
  {
    path: 'oaf/articoli/:anno/:serie/:progressivo',
    canActivate: [AuthGuard],
    data: { permission: 'ordini.fornitori.edit' },
    component: OafDettaglioComponent
  },

  // MONITOR
  {
    path: 'oaf-monitor',
    canActivate: [AuthGuard],
    data: { permission: 'monitor.view' },
    component: OafMonitorComponent
  },

  // ---------------------------------------------------
  // LOGISTICA
  // ---------------------------------------------------
  {
    path: 'logistica-ordini',
    canActivate: [AuthGuard],
    data: { permission: 'logistica.view' },
    component: ListaComponent
  },
  {
    path: 'consegne-settimanali',
    canActivate: [AuthGuard],
    data: { permission: 'logistica.view' },
    component: ConsegneSettimanaliComponent
  },
  {
    path: 'collega-oaf/:progrGenerale/:page/:size/:anno/:serie/:progressivo/:status',
    canActivate: [AuthGuard],
    data: { permission: 'logistica.edit' },
    component: CollegaOAFComponent
  },

  // ---------------------------------------------------
  // RISERVATO
  // ---------------------------------------------------
  {
    path: 'riserve',
    canActivate: [AuthGuard],
    data: { permission: 'monitor.view' },
    component: RiservatoMagazzinoComponent
  },

  // ---------------------------------------------------
  // CARICHI & DEPOSITI
  // ---------------------------------------------------
  {
    path: 'lista-carichi',
    canActivate: [AuthGuard],
    data: { permission: 'carichi.view' },
    component: ListaCarichiComponent
  },
  {
    path: 'lista-carichi-inviata',
    canActivate: [AuthGuard],
    data: { permission: 'carichi.view' },
    component: ListaCarichiInviatiComponent
  },
  {
    path: 'depositi',
    canActivate: [AuthGuard],
    data: { permission: 'depositi.view' },
    component: DepositoComponent
  },
  {
    path: 'carico-detail/edit/:id',
    canActivate: [AuthGuard],
    data: { permission: 'carichi.view' },
    component: ListaCarichiDettaglioComponent
  },
  {
    path: 'carico-detail',
    canActivate: [AuthGuard],
    data: { permission: 'carichi.view' },
    component: ListaCarichiDettaglioComponent
  },

  // ---------------------------------------------------
  // BOX DOCCIA
  // ---------------------------------------------------
  {
    path: 'box-doccia',
    canActivate: [AuthGuard],
    data: { permission: 'boxdoccia.view' },
    component: BoxDocciaComponent
  },

  // ---------------------------------------------------
  // CONTABILITÀ (Trading/Ostuni/Ceglie)
  // ---------------------------------------------------
  {
    path: ':param/ammortamenti',
    canActivate: [AuthGuard],
    data: { permission: 'contabilita.view' },
    component: AmmortamentoComponent,
  },
  {
    path: ':param/cespiti',
    canActivate: [AuthGuard],
    data: { permission: 'contabilita.view' },
    component: CespiteComponent,
  },
  {
    path: ':param/primanota',
    canActivate: [AuthGuard],
    data: { permission: 'contabilita.view' },
    component: PrimanotaComponent,
  },
  {
    path: ':param/tipo-cespiti',
    canActivate: [AuthGuard],
    data: { permission: 'contabilita.view' },
    component: TipoCespiteListComponent,
  },
  {
    path: ':param/tipo-cespiti-detail/:id',
    canActivate: [AuthGuard],
    data: { permission: 'contabilita.view' },
    component: TipoCespiteDetailComponent,
  },
  {
    path: ':param/tipo-cespiti-detail',
    canActivate: [AuthGuard],
    data: { permission: 'contabilita.view' },
    component: TipoCespiteDetailComponent,
  },

  // ---------------------------------------------------
  // DEFAULT
  // ---------------------------------------------------
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
