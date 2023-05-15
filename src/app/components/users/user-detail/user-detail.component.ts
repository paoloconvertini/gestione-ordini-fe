import {Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {takeUntil} from "rxjs";
import {BaseComponent} from "../../baseComponent";
import {Dipendente} from "../../../models/Dipendente";
import {UserService} from "../../../services/users/user.service";
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MatSnackBar} from "@angular/material/snack-bar";
import {RoleService} from "../../../services/role/role.service";
import {Ruolo} from "../../../models/Ruolo";

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent extends BaseComponent implements OnInit {

  loader = false;
  id: any = null;
  dipendente: Dipendente = new Dipendente();
  userForm: any = FormGroup;
  optionRoles: Ruolo[] = [];

  constructor(private fb: FormBuilder, private roleService: RoleService, private service: UserService,
              private router: ActivatedRoute, private route: Router,
              private sanckbar: MatSnackBar) {
    super();
    this.router.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: any) => {
      if (params.id) {
        this.id = params.id;
      }
    });
  }

  ngOnInit(): void {
    this.userForm = this.fb.group({
      name: new FormControl(this.dipendente.name, Validators.required),
      lastname: new FormControl('', Validators.required),
      dataNascita: new FormControl(''),
      password: new FormControl('', this.id ? null : Validators.required),
      codVenditore: new FormControl(''),
      roles: new FormArray([])
    });
    this.getAllRole();
  }

  dipendenteRuoli(): FormArray {
    return this.userForm.get('roles') as FormArray;
  }

  newRuolo(id: any, name: string): FormGroup {
    return this.fb.group({
      id: id,
      name: name
    });
  }

  getUser() {
    this.loader = true;
    this.service.getUser(this.id).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: Dipendente) => {
          this.dipendente = data;
          this.dipendente.roles.forEach(r => {
            this.dipendenteRuoli().push(this.newRuolo(r.id, r.name));
            this.optionRoles.forEach(o => {
              if(o.id === r.id){
                o.checked = true;
                return;
              }
            })
          });
          this.loader = false;
        },
        error: (e: any) => {
          console.error(e);
          this.loader = false;
        }
      })
  }

  getAllRole() {
    this.roleService.getAll().pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: Ruolo[]) => {
          this.optionRoles = data;
          this.loader = false;
          if(this.id) {
            this.getUser();
          }
        },
        error: (e: any) => {
          console.error(e);
          this.loader = false;
        }
      })
  }

  submitForm() {
    this.loader = true;
    if (this.userForm.valid) {
      this.service.create(this.id, this.userForm.value).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            if (res && !res.error) {
              this.route.navigate(['/users']);
            }
            this.loader = false;
          }, error: (e) => {
            this.loader = false;
            if (e) {
              this.sanckbar.open('Utente non creato', 'Chiudi', {
                duration: 2000, horizontalPosition: 'center', verticalPosition: 'top'
              })
            }
          }
        });
    }
  }

  onCheckboxChange(role: Ruolo, event: any) {
    if (event.checked) {
      this.dipendenteRuoli().push(this. newRuolo(role.id, role.name));
    } else {
      const index = this.dipendenteRuoli().controls.findIndex(x => x.value.name === role.name);
      this.dipendenteRuoli().removeAt(index);
    }
  }

  indietro() {
    this.route.navigate(['/users']);
  }
}
