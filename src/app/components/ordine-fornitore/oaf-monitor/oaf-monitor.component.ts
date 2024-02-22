import {Component, OnInit} from '@angular/core';
import {CommonListComponent} from "../../commonListComponent";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {OrdineFornitoreService} from "../../../services/ordine-fornitore/list/ordine-fornitore.service";
import {environment} from "../../../../environments/environment";
import {takeUntil} from "rxjs";
import {MonitorOaf} from "../../../models/MonitorOaf";
import {MonitorDto} from "../../../models/MonitorDto";
import {OrdineClienteService} from "../../../services/ordine-cliente/list/ordine-cliente.service";

@Component({
  selector: 'app-oaf-monitor',
  templateUrl: './oaf-monitor.component.html',
  styleUrls: ['./oaf-monitor.component.css']
})
export class OafMonitorComponent extends CommonListComponent implements OnInit {

  isAdmin: boolean = false;
  monitor: MonitorDto = new MonitorDto();
  monitorOafList: MonitorOaf[] = [];

  constructor(private snackbar: MatSnackBar, private router: ActivatedRoute, private dialog: MatDialog, private service: OrdineFornitoreService, private serviceCliente: OrdineClienteService) {
    super();
    if (localStorage.getItem(environment.ADMIN)) {
      this.isAdmin = true;
    }
  }


  ngOnInit(): void {
    this.retrieveFornitoreList();
    this.retrieveOrdiniList();
  }

  retrieveFornitoreList(): void {
    this.loader = true;
    this.service.getOafByOperatore().pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (data:any) => {
        this.monitorOafList = data;
        this.loader = false;
      }
    })
  }

  retrieveOrdiniList(): void {
    this.loader = true;
    this.serviceCliente.getOrdiniClienteNonOrdinati().pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (data:any) => {
        this.monitor = data;
        this.loader = false;
      }
    })
  }
}
