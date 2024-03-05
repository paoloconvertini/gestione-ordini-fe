import {Component, OnInit} from '@angular/core';
import {CommonListComponent} from "../../commonListComponent";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {map, Observable, startWith, takeUntil} from "rxjs";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {PianocontiService} from "../../../services/pianoconti/pianoconti.service";
import {
  ArticoloClasseFornitoreService
} from "../../../services/ordine-cliente/articolo-classe-fornitore/articolo-classe-fornitore.service";
import {ArticoloClasseFornitore} from "../../../models/ArticoloClasseFornitore";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AddFornitoreDialogComponent} from "../../add-fornitore-dialog/add-fornitore-dialog.component";

@Component({
  selector: 'app-articolo-classe-fornitore',
  templateUrl: './articolo-classe-fornitore.component.html',
  styleUrls: ['./articolo-classe-fornitore.component.css']
})
export class ArticoloClasseFornitoreComponent extends CommonListComponent implements OnInit{

  myControl = new FormControl('');
  articoloClasseFornitoreForm: any = FormGroup;
  articoloClasseFornitoreList: ArticoloClasseFornitore[] = [];
  filteredOptions: Observable<any[]> | undefined;
  conto: any;
  articoloClasseFornitore: ArticoloClasseFornitore = new ArticoloClasseFornitore();

  constructor(private dialog: MatDialog, private fb: FormBuilder, private snackbar: MatSnackBar, private dialogRef: MatDialogRef<ArticoloClasseFornitoreComponent>,private service: ArticoloClasseFornitoreService) {
    super();
  }

  ngOnInit(): void {
    this.articoloClasseFornitoreForm = this.fb.group({
      codice: new FormControl(''),
      descrizione: new FormControl(''),
      descrUser: new FormControl('', Validators.required),
      descrUser2: new FormControl('', Validators.required),
      descrUser3: new FormControl('')
    });
    this.getClassi();
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  getClassi(): void {
    this.loader = true;
    this.service.getClassi().pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data) => {
          this.articoloClasseFornitoreList = data;
          this.loader = false;
        },
        error: (e: any) => {
          console.error(e);
          this.loader = false;
        }
      })
  }


  saveClasse(): void {
    this.loader = true;
    this.service.saveClasse(this.articoloClasseFornitore).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          this.loader = false;
          this.snackbar.open(res.msg, 'Chiudi', {
            duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
          });
          this.dialogRef.close();
        }
      })
  }

  private _filter(value: any): any[] {
    let filterValue: string;
    if(value instanceof Object) {
      filterValue = value.descrizione.toLowerCase();
    } else {
      filterValue = value.toLowerCase();
    }
    return this.articoloClasseFornitoreList.filter((option: { descrizione: string; }) => option.descrizione.toLowerCase().includes(filterValue));
  }


  onNoClick(): void {
    this.dialogRef.close();
  }

  getOption(option: any) {
    return option.descrizione;
  }

  cercaConto() {
    const dialogRef = this.dialog.open(AddFornitoreDialogComponent, {
      width: '30%'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loader = true;
        this.articoloClasseFornitore.descrUser2 = result.sottoConto;
      }
    });
  }
}
