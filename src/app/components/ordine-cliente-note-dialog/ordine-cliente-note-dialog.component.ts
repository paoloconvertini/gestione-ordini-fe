import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {OrdineClienteNotaDto} from "../../models/OrdineClienteNotaDto";

@Component({
  selector: 'app-ordine-cliente-note-dialog',
  templateUrl: './ordine-cliente-note-dialog.component.html',
  styleUrls: ['./ordine-cliente-note-dialog.component.css']
})
export class OrdineClienteNoteDialogComponent {

  ordine: OrdineClienteNotaDto = new OrdineClienteNotaDto();

  constructor(private dialogRef: MatDialogRef<OrdineClienteNoteDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: OrdineClienteNotaDto) {
    this.ordine = data;
  }

  salva() {
      this.dialogRef.close(this.ordine);
  }

}
