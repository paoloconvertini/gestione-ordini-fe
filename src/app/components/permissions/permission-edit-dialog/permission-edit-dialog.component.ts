import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PermissionApiService } from '../../../services/permission/permission-api.service';

@Component({
  selector: 'app-permission-edit-dialog',
  templateUrl: './permission-edit-dialog.component.html',
  styleUrls: ['./permission-edit-dialog.component.css']
})
export class PermissionEditDialogComponent {

  model = { name: '', description: '' };

  constructor(
    private dialogRef: MatDialogRef<PermissionEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private permApi: PermissionApiService
  ) {
    this.model.name = data.name;
    this.model.description = data.description;
  }

  save() {
    this.permApi.updatePermesso(this.data.id, this.model)
      .subscribe(() => this.dialogRef.close(true));
  }

  close(){
    this.dialogRef.close(false);
  }

}

