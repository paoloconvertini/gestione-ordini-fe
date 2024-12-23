import {Component} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth/auth.service';
import {MatSnackBar} from "@angular/material/snack-bar";
import {environment} from "../../../environments/environment";
import {takeUntil} from "rxjs";
import { BaseComponent } from '../baseComponent';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent extends BaseComponent{
  form = new FormGroup({
    username: new FormControl(null, Validators.required),
    password: new FormControl(null, Validators.required),
  });
  hide = true;

  constructor(private authService: AuthService, private router: Router, private sanckbar: MatSnackBar) {
    super();
  }

  submitForm() {
    if (this.form.valid) {
      this.authService.login({
        username: this.username.value,
        password: this.password.value
      }).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (res) => {
           this.router.navigate(['/ordini-clienti']);
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

  resetPassword() {
    this.router.navigate(['/reset-password']);
  }
}
