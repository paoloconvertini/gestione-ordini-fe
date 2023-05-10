import { Component } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth/auth.service";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {takeUntil} from "rxjs";
import {environment} from "../../../environments/environment";
import {BaseComponent} from "../baseComponent";

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent extends BaseComponent{

  form = new FormGroup({
    username: new FormControl(null, Validators.required),
    password: new FormControl(null, Validators.required),
    password2: new FormControl(null, Validators.required),
  });
  hide = true;
  hide2 = true;

  constructor(private authService: AuthService, private router: Router, private sanckbar: MatSnackBar) {
    super();
  }

  submitForm() {
    if (this.form.valid && this.password.value === this.password2.value) {
      this.authService.updatePassword(this.username.value,{password: this.password.value})
        .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (res) => {
           if(res && !res.error) {
             this.sanckbar.open(res.message, 'Chiudi', {
               duration: 2000, horizontalPosition: 'center', verticalPosition: 'top'
             })
             this.router.navigate(['/login']);
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

  get password2() : FormControl {
    return this.form.get('password2') as FormControl;
  }

}
