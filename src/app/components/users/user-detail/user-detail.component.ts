import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { takeUntil } from "rxjs";
import { BaseComponent } from "../../baseComponent";
import { Dipendente } from "../../../models/Dipendente";
import { UserService } from "../../../services/users/user.service";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { RoleService } from "../../../services/role/role.service";
import { Ruolo } from "../../../models/Ruolo";
import { AuthService } from "../../../services/auth/auth.service";

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

  // Permessi
  canManage: boolean = false;

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private service: UserService,
    private ar: ActivatedRoute,
    private route: Router,
    private snackBar: MatSnackBar,
    private auth: AuthService
  ) {
    super();

    this.ar.params
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((params: any) => this.id = params.id);
  }

  ngOnInit(): void {

    // 🔥 Unico permesso richiesto per visualizzare e modificare
    this.canManage = this.auth.hasPerm('users.manage');

    if (!this.canManage) {
      return; // blocca subito init
    }

    this.buildForm();
    this.getAllRole();
  }

  private buildForm(): void {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', Validators.email],
      dataNascita: [''],
      password: ['', this.id ? [] : Validators.required], // obbligatoria solo in creazione
      codVenditore: [''],
      roles: this.fb.array([])
    });
  }

  get rolesFA(): FormArray {
    return this.userForm.get('roles') as FormArray;
  }

  private patchDipendente(data: Dipendente): void {
    this.dipendente = data;

    this.userForm.patchValue({
      name: data.name,
      lastname: data.lastname,
      email: data.email,
      dataNascita: data.dataNascita,
      codVenditore: data.codVenditore,
    });

    // Ripuliamo ruoli e ripopoliamo
    this.rolesFA.clear();

    data.roles.forEach(r => {
      this.rolesFA.push(
        this.fb.group({
          id: r.id,
          name: r.name
        })
      );
    });

    // Aggiorna check visivi
    this.optionRoles.forEach(o => {
      o.checked = data.roles.some(dr => dr.id === o.id);
    });
  }

  getUser(): void {
    this.loader = true;

    this.service.getUser(this.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: Dipendente) => {
          this.patchDipendente(res);
          this.loader = false;
        },
        error: () => this.loader = false
      });
  }

  getAllRole(): void {
    this.loader = true;

    this.roleService.getAll()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: Ruolo[]) => {
          this.optionRoles = data;

          // Se sono in modifica, carico anche l’utente
          if (this.id) {
            this.getUser();
          }

          this.loader = false;
        },
        error: () => this.loader = false
      });
  }

  onCheckboxChange(role: Ruolo, event: any): void {
    if (event.checked) {
      this.rolesFA.push(
        this.fb.group({
          id: role.id,
          name: role.name
        })
      );
    } else {
      const idx = this.rolesFA.controls.findIndex(c => c.value.id === role.id);
      if (idx >= 0) this.rolesFA.removeAt(idx);
    }
  }

  submitForm(): void {
    if (!this.canManage) return;
    if (!this.userForm.valid) return;

    this.loader = true;

    this.service.create(this.id, this.userForm.value)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          if (res && !res.error) {
            this.route.navigate(['/users']);
          }
          this.loader = false;
        },
        error: () => {
          this.snackBar.open('Errore nel salvataggio', 'Chiudi', { duration: 2000 });
          this.loader = false;
        }
      });
  }

  indietro(): void {
    this.route.navigate(['/users']);
  }
}
