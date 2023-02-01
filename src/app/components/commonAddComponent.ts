import {Directive} from "@angular/core";
import {CommonService} from "../services/CommonSerivce";
import {MatSnackBar} from "@angular/material/snack-bar";
import {SnackbarComponent} from "./snackbar/snackbar.component";

@Directive()
export class CommonAddComponent {

  protected constructor(private service: CommonService, private _snackBar: MatSnackBar) {
  }

  save(msg:string, data:any): void {
    this.service.create(data)
      .subscribe({
        next: (res) => {
          console.log(res);
          if(res && !res.error) {
            this.openSnackBar(msg);
          }
        },
        error: (e) => console.error(e)
      });
  }

  private openSnackBar(msg:string) {
    this._snackBar.openFromComponent(SnackbarComponent,{
      horizontalPosition: 'center',
      verticalPosition: 'top',
      duration: 2000,
      data: {
        snackType: 'Success',
        msg: msg
      }
    });
  }
}
