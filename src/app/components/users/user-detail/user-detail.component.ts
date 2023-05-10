import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {takeUntil} from "rxjs";
import {BaseComponent} from "../../baseComponent";
import {Dipendente} from "../../../models/Dipendente";
import {UserService} from "../../../services/users/user.service";
import {FormArray, FormControl, FormGroup} from "@angular/forms";
import {environment} from "../../../../environments/environment";
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
  id: any;
  dipendente: Dipendente = new Dipendente();

  userForm = new FormGroup({
    name: new FormControl(''),
    lastname: new FormControl(''),
    dataNascita: new FormControl(''),
    password: new FormControl(''),
    codVenditore: new FormControl(''),
    roles: new FormArray([])
  });

  optionRoles: Ruolo[] = [];

  constructor(private roleService: RoleService, private service: UserService, private router: ActivatedRoute, private route: Router, private sanckbar: MatSnackBar) {
    super();
    this.router.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: any) => {
      this.id = params.id;
    });
  }

  ngOnInit(): void {
    this.getUser();
    this.getAllRole();

  }

  getUser() {
    this.loader = true;
    this.service.getUser(this.id).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: Dipendente) => {
          this.dipendente = data;
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
      this.service.create(this.id, this.dipendente).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (res: any) => {
          if(res && !res.error) {
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
}
