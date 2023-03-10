import {Component} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth/auth.service';
import {MatSnackBar} from "@angular/material/snack-bar";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  form = new FormGroup({
    username: new FormControl(null, Validators.required),
    password: new FormControl(null, Validators.required),
  });

  isAdmin: boolean = false;
  isMagazziniere: boolean = false;
  isAmministrativo: boolean = false;
  isVenditore: boolean = false;

  constructor(private authService: AuthService, private router: Router, private sanckbar: MatSnackBar) {
  }

  submitForm() {
    if (this.form.valid) {
      this.authService.login({
        username: this.username.value,
        password: this.password.value
      }).subscribe({
        next: (res) => {
          if (localStorage.getItem(environment.MAGAZZINIERE)) {
            this.router.navigate(['/ordini-clienti/DA_PROCESSARE']);
          } else if (localStorage.getItem(environment.AMMINISTRATIVO)) {
            this.router.navigate(['/ordini-clienti/DA_ORDINARE']);
          } else {
            this.router.navigate(['/ordini-clienti']);
          }
        },
        error: (e) => {
          if (e) {
            this.sanckbar.open('Utente non trovato', 'Chiudi', {
              duration: 2000, horizontalPosition: 'center', verticalPosition: 'top'
            })
          }
        }
      });
    }
  }

  get username()
    :
    FormControl {
    return this.form.get('username') as FormControl;
  }

  get password()
    :
    FormControl {
    return this.form.get('password') as FormControl;
  }
}
