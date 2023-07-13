import {Component, OnInit} from '@angular/core';
import {CommonListComponent} from "../commonListComponent";
import {MatDialogRef} from "@angular/material/dialog";
import {PianocontiService} from "../../services/pianoconti/pianoconti.service";
import {map, Observable, startWith, takeUntil} from "rxjs";
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-add-fornitore-dialog',
  templateUrl: './add-fornitore-dialog.component.html',
  styleUrls: ['./add-fornitore-dialog.component.css']
})
export class AddFornitoreDialogComponent extends CommonListComponent implements OnInit{

  myControl = new FormControl('');
  fornitori: any = [];
  filteredOptions: Observable<any[]> | undefined;
  conto: any;

  constructor(private dialogRef: MatDialogRef<AddFornitoreDialogComponent>,private service: PianocontiService) {
    super();
  }

  ngOnInit(): void {
    this.getFornitori();
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  getFornitori(): void {
    this.loader = true;
      this.service.getFornitori().pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (data) => {
            this.fornitori = data;
            this.loader = false;
          },
          error: (e: any) => {
            console.error(e);
            this.loader = false;
          }
        })
  }

  private _filter(value: any): any[] {
    let filterValue: string;
    if(value instanceof Object) {
      filterValue = value.intestazione.toLowerCase();
    } else {
      filterValue = value.toLowerCase();
    }
    return this.fornitori.filter((option: { intestazione: string; }) => option.intestazione.toLowerCase().includes(filterValue));
  }


  onNoClick(): void {
    this.dialogRef.close();
  }

  submitForm() {
      this.dialogRef.close(this.conto);
  }

  getOption(option: any) {
    return option.intestazione;
  }

}
