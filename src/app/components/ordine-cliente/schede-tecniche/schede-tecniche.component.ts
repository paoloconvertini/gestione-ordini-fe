import {Component, Inject, OnInit} from '@angular/core';
import {FormControl} from "@angular/forms";
import {map, Observable, startWith, takeUntil} from "rxjs";
import {CommonListComponent} from "../../commonListComponent";
import {ArticoloService} from "../../../services/ordine-cliente/articolo/articolo.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";

export interface DialogData {
  articoliList: any;
}

@Component({
  selector: 'app-schede-tecniche',
  templateUrl: './schede-tecniche.component.html',
  styleUrls: ['./schede-tecniche.component.css']
})
export class SchedeTecnicheComponent extends CommonListComponent implements OnInit{

  list: any = [];
  myControl = new FormControl('');
  folders: any = [];
  filteredOptions: Observable<any[]> | undefined;
  formData: FormData = new FormData();
  articoloList: any = [];

  constructor(private dialogRef: MatDialogRef<SchedeTecnicheComponent>,private snackbar: MatSnackBar,
              private service: ArticoloService, @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    super();
    this.articoloList = this.data.articoliList;
  }

  ngOnInit(): void {
    this.articoloList.forEach((a: string) => {
      this.list.push({
        codArtFornitore: a,
        fileName: '',
        folder: ''
      });
    })
    this.getFolders();
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  getFolders(): void {
    this.loader = true;
    this.service.cercaCartelleSchedeTecniche().pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data) => {
          this.folders = data;
          this.loader = false;
        },
        error: (e: any) => {
          console.error(e);
          this.loader = false;
        }
      })
  }

  private _filter(value: any): any[] {
    let filterValue: string = value.toLowerCase();
    return this.folders.filter((option: string) => option.toLowerCase().includes(filterValue));
  }


  onFileSelected(event: any, element: any) {
    const file:File = event.target.files[0];
    if (file) {
      element.fileName = file.name;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', file.name);
      formData.append('folder', element.folder);
      this.loader = true;
      this.service.uploadSchedeTecniche(formData).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res) => {
            this.loader = false;
            this.snackbar.open(res.msg, 'Chiudi', {
              duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
            });
          },
          error: (e) => {
            console.error(e);
            this.snackbar.open('Errore! Non è stato possibile caricare la scheda tecnicha', 'Chiudi', {
              duration: 2000, horizontalPosition: 'center', verticalPosition: 'top'
            })
            this.loader = false;
          }
        });
    }
  }

  chiudi() {
    this.dialogRef.close();
  }

  getOption(option: any) {
    return option;
  }
}
