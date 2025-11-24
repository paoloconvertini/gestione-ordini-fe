import { Component, QueryList, ViewChildren, AfterViewInit } from '@angular/core';
import { MatMenu } from '@angular/material/menu';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements AfterViewInit {

  @ViewChildren('menuRef') menus!: QueryList<MatMenu>;

  menuRefs: MatMenu[] = [];

  constructor(public auth: AuthService) {}

  ngAfterViewInit() {
    // ❗ Ci permette di associare ogni <mat-menu> dinamico al suo trigger
    this.menuRefs = this.menus.toArray();
  }

  // -----------------------------------------------------
  // ACCESSO PERMESSI
  // -----------------------------------------------------
  hasPerm(item: any): boolean {
    if (!item.permission) return true;
    return this.auth.hasPerm(item.permission);
  }

  logout() {
    this.auth.logout();
  }

  // -----------------------------------------------------
  // MENU DINAMICO (DA COMPLETARE CON PERMESSI)
  // -----------------------------------------------------
  menu = [
    {
      label: 'Ordini Clienti',
      permission: 'ordini.view',
      children: [
        { label: 'Tutti', route: ['/ordini-clienti'], permission: 'ordini.view' },
        { label: 'Da processare', route: ['/ordini-clienti', 'DA_PROCESSARE'], permission: 'ordini.processare' },
        { label: 'Da ordinare', route: ['/ordini-clienti', 'DA_ORDINARE'], permission: 'ordini.ordinare' },
        { label: 'Incompleti', route: ['/ordini-clienti', 'INCOMPLETO'], permission: 'ordini.view' },
        { label: 'Completi', route: ['/ordini-clienti', 'COMPLETO'], permission: 'ordini.view' },
        { label: 'Archiviato', route: ['/ordini-clienti', 'ARCHIVIATO'], permission: 'ordini.view' },
      ]
    },
    {
      label: 'Ordini Fornitori',
      permission: 'fornitori.view',
      children: [
        { label: 'Sospesi', route: ['/ordini-fornitore', 'F'], permission: 'fornitori.view' },
        { label: 'Da approvare', route: ['/ordini-fornitore', 'T'], permission: 'fornitori.approvare' },
        { label: 'Approvati', route: ['/ordini-fornitore'], permission: 'fornitori.view' }
      ]
    },
    {
      label: 'Logistica',
      permission: 'logistica.view',
      children: [
        { label: 'Pronto consegna', route: ['/ordini-clienti'], permission: 'logistica.view' },
        { label: 'Gestione consegne', route: ['/logistica-ordini'], permission: 'logistica.view' },
        { label: 'Consegne settimanali', route: ['/consegne-settimanali'], permission: 'logistica.view' }
      ]
    },
    {
      label: 'Analisi dati',
      permission: 'monitor.view',
      children: [
        { label: 'Riservato Magazzino', route: ['/riserve'], permission: 'monitor.magazzino' },
        { label: 'Situazione ordini', route: ['/oaf-monitor'], permission: 'monitor.ordini' }
      ]
    },
    {
      label: 'Box Doccia',
      permission: 'boxdoccia.view',
      route: ['/box-doccia']
    },
    {
      label: 'Contabilità',
      permission: 'contabilita.view',
      children: [
        { label: 'Trading', route: ['/t/ammortamenti'], permission: 'contabilita.trading' },
        { label: 'Ostuni', route: ['/o/ammortamenti'], permission: 'contabilita.ostuni' },
        { label: 'Ceglie', route: ['/c/ammortamenti'], permission: 'contabilita.ceglie' },
      ]
    },
    {
      label: 'Lista Carichi',
      permission: 'carichi.view',
      children: [
        { label: 'Da inviare', route: ['/lista-carichi'], permission: 'carichi.view' },
        { label: 'Inviata', route: ['/lista-carichi-inviata'], permission: 'carichi.view' },
        { label: 'Depositi', route: ['/depositi'], permission: 'carichi.view' }
      ]
    },
    {
      label: 'Dipendenti',
      permission: 'users.view',
      route: ['/users']
    },
    {
      label: 'Ruoli',
      permission: 'roles.view',
      route: ['/role']
    },
    {
      label: 'Permessi',
      permission: 'permissions.manage',
      route: ['/permissions']
    }
  ];
}
