import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';

export interface NavItem {
  label: string;
  icon?: string;
  route?: string | any[];
  children?: NavItem[];
  perm?: string;           // permesso richiesto per mostrare
  hideIf?: string[];       // permessi per cui NASCONDERE il menu
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  constructor(private auth: AuthService) {}

  /**
   * MENU CENTRALIZZATO
   * Ogni voce può essere protetta da perm: 'xxx'
   */
  getMenu(): NavItem[] {
    return [
      // --- AMMINISTRAZIONE -------------------------
      {
        label: 'Gestisci dipendenti',
        icon: 'person',
        route: ['/users'],
        perm: 'admin.users.view'
      },
      {
        label: 'Gestisci ruoli',
        icon: 'manage_accounts',
        route: ['/role'],
        perm: 'admin.roles.view'
      },
      {
        label: 'Permessi',
        icon: 'lock',
        route: ['/role-permissions'],
        perm: 'admin.permissions.manage'
      },

      // --- ORDINI CLIENTI -------------------------
      {
        label: 'Ordine Clienti',
        icon: 'shopping_cart',
        children: [
          { label: 'Tutti', route: ['/ordini-clienti'], perm: 'orders.client.view' },
          { label: 'Da processare', route: ['/ordini-clienti','DA_PROCESSARE'], perm: 'orders.client.process' },
          { label: 'Da ordinare', route: ['/ordini-clienti','DA_ORDINARE'], perm: 'orders.client.order' },
          { label: 'Incompleti', route: ['/ordini-clienti','INCOMPLETO'], perm: 'orders.client.view' },
          { label: 'Completi', route: ['/ordini-clienti','COMPLETO'], perm: 'orders.client.view' },
          { label: 'Archiviati', route: ['/ordini-clienti','ARCHIVIATO'], perm: 'orders.client.view' },
        ]
      },

      // --- ORDINE FORNITORI -------------------------
      {
        label: 'Ordine Fornitori',
        icon: 'store',
        children: [
          { label: 'Sospesi', route: ['/ordini-fornitore','F'], perm: 'orders.for.view' },
          { label: 'Da approvare', route: ['/ordini-fornitore','T'], perm: 'orders.for.approve' },
          { label: 'Approvati', route: ['/ordini-fornitore'], perm: 'orders.for.view' },
        ]
      },

      // --- LOGISTICA -------------------------
      {
        label: 'Logistica',
        icon: 'local_shipping',
        children: [
          { label: 'Pronto consegna', route: ['/ordini-clienti'], perm: 'logistics.view' },
          { label: 'Gestione consegne', route: ['/logistica-ordini'], perm: 'logistics.manage' },
          { label: 'Consegne settimanali', route: ['/consegne-settimanali'], perm: 'logistics.view' },
        ]
      },

      // --- ANALISI DATI -------------------------
      {
        label: 'Analisi dati',
        icon: 'analytics',
        perm: 'analysis.view',
        children: [
          { label: 'Riservato magazzino', route: ['/riserve'], perm: 'analysis.view' },
          { label: 'Situazione ordini', route: ['/oaf-monitor'], perm: 'analysis.admin' }
        ]
      },

      // --- BOX DOCCIA -------------------------
      {
        label: 'Box doccia',
        icon: 'shower',
        route: ['/box-doccia'],
        perm: 'boxdoccia.view'
      },

      // --- CONTABILITÀ -------------------------
      {
        label: 'Contabilità',
        icon: 'account_balance',
        perm: 'accounting.view',
        children: [
          { label: 'Registro cespiti', route: ['/c/ammortamenti'], perm: 'accounting.view' },
          { label: 'Cespiti', route: ['/c/cespiti'], perm: 'accounting.view' },
          { label: 'Primanota', route: ['/c/primanota'], perm: 'accounting.view' },
          { label: 'Tipo cespiti', route: ['/c/tipo-cespiti'], perm: 'accounting.view' },
        ]
      },

      // --- LISTA CARICHI -------------------------
      {
        label: 'Lista Carichi',
        icon: 'inventory',
        perm: 'warehouse.view',
        children: [
          { label: 'Da inviare', route: ['/lista-carichi'], perm: 'warehouse.view' },
          { label: 'Inviata', route: ['/lista-carichi-inviata'], perm: 'warehouse.view' },
          { label: 'Depositi', route: ['/depositi'], perm: 'warehouse.view' },
        ]
      }
    ];
  }

  /**
   * Filtra il menu in base ai permessi dell'utente
   */
  getFilteredMenu(): NavItem[] {
    const menu = this.getMenu();

    const filter = (item: NavItem): boolean => {
      if (item.perm && !this.auth.hasPerm(item.perm)) return false;

      if (item.children) {
        item.children = item.children.filter(filter);
        return item.children.length > 0;
      }

      return true;
    };

    return menu.filter(filter);
  }
}
