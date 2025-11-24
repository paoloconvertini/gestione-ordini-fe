import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {takeUntil} from "rxjs";
import {BaseComponent} from "../../baseComponent";
import {Dipendente} from "../../../models/Dipendente";
import {UserService} from "../../../services/users/user.service";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from "@angular/forms";
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
  dipendente!: Dipendente;
  userForm!: FormGroup;
  optionRoles: Ruolo[] = [];

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private service: UserService,
    private router: ActivatedRoute,
    private route: Router,
    private sanckbar: MatSnackBar
  ) {
    super();
    this.router.params.pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((params: any) => this.id = params.id);
  }

  ngOnInit(): void {
    this.buildForm();
    this.getAllRole();
  }

  private buildForm() {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', Validators.email],
      dataNascita: [''],
      password: ['', this.id ? [] : Validators.required],
      codVenditore: [''],
      roles: this.fb.array([])
    });
  }

  get rolesFA(): FormArray {
    return this.userForm.get('roles') as FormArray;
  }

  private patchDipendente(data: Dipendente) {
    this.dipendente = data;

    this.userForm.patchValue({
      name: data.name,
      lastname: data.lastname,
      email: data.email,
      dataNascita: data.dataNascita,
      codVenditore: data.codVenditore,
    });

    this.rolesFA.clear();

    data.roles.forEach(r => {
      this.rolesFA.push(this.fb.group({
        id: r.id,
        name: r.name
      }));
    });

    this.optionRoles.forEach(o => {
      o.checked = data.roles.some(dr => dr.id === o.id);
    });
  }

  getUser() {
    this.loader = true;
    this.service.getUser(this.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: res => { this.patchDipendente(res); this.loader = false; },
        error: () => this.loader = false
      });
  }

  getAllRole() {
    this.loader = true;
    this.roleService.getAll()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: Ruolo[]) => {
          this.optionRoles = data;
          if (this.id) this.getUser();
          this.loader = false;
        },
        error: () => this.loader = false
      });
  }

  onCheckboxChange(role: Ruolo, event: any) {
    if (event.checked) {
      this.rolesFA.push(this.fb.group({
        id: role.id,
        name: role.name
      }));
    } else {
      const idx = this.rolesFA.controls.findIndex(c => c.value.id === role.id);
      if (idx >= 0) this.rolesFA.removeAt(idx);
    }
  }

  submitForm() {
    if (!this.userForm.valid) return;

    this.loader = true;
    this.service.create(this.id, this.userForm.value)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          if (res && !res.error) this.route.navigate(['/users']);
          this.loader = false;
        },
        error: () => {
          this.sanckbar.open('Utente non creato', 'Chiudi', { duration: 2000 });
          this.loader = false;
        }
      });
  }

  indietro() {
    this.route.navigate(['/users']);
  }
}
