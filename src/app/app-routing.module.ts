import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginComponent} from "./components/login/login.component";
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import {AuthGuard} from "./guards/auth.guard";
import {OrdineClienteComponent} from "./components/ordine-cliente/ordine-cliente-list/ordine-cliente.component";
import {ArticoloComponent} from "./components/articolo/articolo.component";

const routes: Routes = [
 {
    path: 'dashboard',
    canActivate: [AuthGuard],
    component: DashboardComponent,
  },
  {
    path: 'ordini-clienti',
    canActivate: [AuthGuard],
    component: OrdineClienteComponent,
  },
  {
    path: 'ordini-clienti/:status',
    canActivate: [AuthGuard],
    component: OrdineClienteComponent,
  },
  {
    path: 'articoli/:anno/:serie/:progressivo/:status',
    canActivate: [AuthGuard],
    component: ArticoloComponent,
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

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
