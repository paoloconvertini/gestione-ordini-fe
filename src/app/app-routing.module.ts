import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginComponent} from "./components/login/login.component";
import {AuthGuard} from "./guards/auth.guard";
import {OrdineClienteComponent} from "./components/ordine-cliente/ordine-cliente-list/ordine-cliente.component";
import {ArticoloComponent} from "./components/ordine-cliente/articolo/articolo.component";
import {OafListComponent} from "./components/ordine-fornitore/oaf-list/oaf-list.component";
import {OafDettaglioComponent} from "./components/ordine-fornitore/oaf-dettaglio/oaf-dettaglio.component";

const routes: Routes = [
  {
    path: 'ordini-clienti',
    canActivate: [AuthGuard],
    component: OrdineClienteComponent,
  },
  {
    path: 'ordini-fornitore',
    canActivate: [AuthGuard],
    component: OafListComponent,
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
    path: 'articoli/:anno/:serie/:progressivo/:status',
    canActivate: [AuthGuard],
    component: ArticoloComponent,
  },
  {
    path: 'articoli/:anno/:serie/:progressivo',
    canActivate: [AuthGuard],
    component: ArticoloComponent,
  },
  {
    path: 'oaf/articoli/:anno/:serie/:progressivo',
    canActivate: [AuthGuard],
    component: OafDettaglioComponent,
  },
  {
    path: 'oaf/articoli/:anno/:serie/:progressivo/:status',
    canActivate: [AuthGuard],
    component: OafDettaglioComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
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
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
