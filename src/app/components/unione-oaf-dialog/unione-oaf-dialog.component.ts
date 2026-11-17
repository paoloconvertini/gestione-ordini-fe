import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AnteprimaUnioneOaf} from '../../models/anteprima-unione-oaf';

@Component({
  selector: 'app-unione-oaf-dialog',
  templateUrl: './unione-oaf-dialog.component.html',
  styleUrls: ['./unione-oaf-dialog.component.css']
})
export class UnioneOafDialogComponent {
  confermaDiversi = false;
  constructor(@Inject(MAT_DIALOG_DATA) public data: AnteprimaUnioneOaf,
              private dialog: MatDialogRef<UnioneOafDialogComponent>) {}
  conferma(): void {
    if (!this.data.fornitoriDiversi || this.confermaDiversi) this.dialog.close(true);
  }
}
