import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { takeUntil } from 'rxjs';
import { BaseComponent } from '../baseComponent';
import { ShowroomService } from '../../services/showroom/showroom.service';
import { PermissionService } from '../../services/auth/permission.service';
import {FiltroShowroom} from "../../models/FiltroShowroom";
import {RegistroVisiteDialogComponent} from "../registro-visite-dialog/registro-visite-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {AssociaClienteDialogComponent} from "../associa-cliente-dialog/associa-cliente-dialog.component";
import {AuthService} from "../../services/auth/auth.service";

@Component({
  selector: 'app-showroom',
  templateUrl: './showroom.component.html',
  styleUrls: ['./showroom.component.css']
})
export class ShowroomComponent extends BaseComponent implements OnInit {

  loader = false;
  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = [
    'dataVisita',
    'nomeCliente',
    'comune',
    'motivo',
    'venditore',
    'azioni'
  ];

  filtro: FiltroShowroom = new FiltroShowroom();

  totalItems = 0;

  province: string[] = [];
  listaComuni: any[] = [];
  sedi: any[] = [];
  comuneSearch: string | null = null;


  constructor(
    private service: ShowroomService,
    public perm: PermissionService,
    private dialog: MatDialog
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadProvince();
    this.retrieveList();
    if (this.perm.canFilterSede) {
      this.loadSedi();
    }
    this.displayedColumns = [
      ...(this.perm.canFilterSede ? ['sede'] : []),
      'dataVisita',
      'nomeCliente',
      'comune',
      'motivo',
      'venditore',
      'azioni'
    ];
  }

  onPageChange(event: PageEvent) {
    this.filtro.page = event.pageIndex;
    this.filtro.size = event.pageSize;
    this.retrieveList();
  }

  cerca(): void {
    this.filtro.page = 0;
    this.retrieveList();
  }

  reset(): void {
    this.filtro = new FiltroShowroom();
    this.comuneSearch = null;
    this.retrieveList();
  }

  retrieveList(): void {
    this.loader = true;

    this.service.search(this.filtro)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: any) => {
          this.totalItems = data.count;
          this.dataSource.data = data.list;
          this.loader = false;
        },
        error: () => {
          this.loader = false;
        }
      });
  }

  loadProvince() {
    this.service.getProvince()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => this.province = res);
  }

  onComuneSearch(value: string) {

    if (!value || value.length < 3) {
      this.listaComuni = [];
      return;
    }

    this.service.searchComuni(
      this.filtro.provincia || null,
      value
    ).subscribe(res => {
      this.listaComuni = res;
    });
  }

  selectComune(c: any) {

    this.filtro.comuneIstat = c.codiceIstat;
    this.comuneSearch = c.nomeComune;
    this.listaComuni = [];

    // opzionale ma elegante:
    this.filtro.provincia = c.siglaProvincia;
  }

  onProvinciaChange() {
    this.filtro.comuneIstat = null;
    this.comuneSearch = null;
    this.listaComuni = [];
  }

  delete(id: number) {

    if (!confirm('Confermi eliminazione?')) return;

    this.service.delete(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => this.retrieveList());
  }

  openDialog(element?: any) {

    const dialogRef = this.dialog.open(RegistroVisiteDialogComponent, {
      width: '700px',
      data: element
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.retrieveList();
      }
    });
  }

  openAssociaCliente(id: number) {

    const dialogRef = this.dialog.open(
      AssociaClienteDialogComponent,
      { width: '500px', data: id }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cerca();
      }
    });
  }

  loadSedi() {
    this.service.getSedi().subscribe(res => {
      this.sedi = res;
    });
  }
}
