import { Component, OnInit } from '@angular/core';
import { ShowroomService } from '../../../services/showroom/showroom.service';
import { MatDialog } from '@angular/material/dialog';
import {MotivoDialogComponent} from "../motivo-dialog/motivo-dialog.component";
import {ConfirmDialogComponent} from "../../confirm-dialog/confirm-dialog.component";

@Component({
  selector: 'app-gestione-motivi',
  templateUrl: './gestione-motivi.component.html',
  styleUrls: ['./gestione-motivi.component.css']
})
export class GestioneMotiviComponent implements OnInit {

  rootList: any[] = [];
  figliMap: { [key: number]: any[] } = {};
  loading = false;

  constructor(
    private showroomService: ShowroomService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadRoot();
  }

  loadRoot() {
    this.loading = true;
    this.showroomService.getMotiviRoot().subscribe(res => {
      this.rootList = res;
      this.loading = false;

      // Carichiamo automaticamente i figli
      this.rootList.forEach(root => {
        this.loadFigli(root.id);
      });
    });
  }

  loadFigli(parentId: number) {
    this.showroomService.getMotiviFigli(parentId).subscribe(res => {
      this.figliMap[parentId] = res;
    });
  }

  createRoot() {
    const dialogRef = this.dialog.open(MotivoDialogComponent, {
      width: '400px',
      data: { parentId: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      this.showroomService.createMotivo(result)
        .subscribe(() => this.loadRoot());
    });
  }

  createFiglio(parentId: number) {
    const dialogRef = this.dialog.open(MotivoDialogComponent, {
      width: '400px',
      data: { parentId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      this.showroomService.createMotivo(result)
        .subscribe(() => this.loadRoot());
    });
  }

  edit(motivo: any) {
    const dialogRef = this.dialog.open(MotivoDialogComponent, {
      width: '400px',
      data: { motivo }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      this.showroomService.updateMotivo(motivo.id, {
        descrizione: result.descrizione,
        parentId: motivo.parentId ?? null
      }).subscribe(() => this.loadRoot());
    });
  }

  deleteMotivo(id: number) {

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        msg: 'Il motivo verrà disattivato e non sarà più selezionabile. Confermi?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {

      if (!result) return;

      this.showroomService.disattivaMotivo(id)
        .subscribe(() => {
          this.loadRoot();
        });

    });
  }
}
