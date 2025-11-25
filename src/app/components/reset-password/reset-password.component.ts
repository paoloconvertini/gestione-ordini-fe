import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../../services/auth/auth.service";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { takeUntil } from "rxjs";
import { BaseComponent } from "../baseComponent";

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent extends BaseComponent {

  form = new FormGroup({
    username: new FormControl(null, Validators.required),
    password: new FormControl(null, Validators.required),
    password2: new FormControl(null, Validators.required),
  });

  hide = true;
  hide2 = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    super();
  }

  submitForm(): void {

    if (
      this.form.valid &&
      this.form.value.password &&
      this.form.value.password2 &&
      this.form.value.password === this.form.value.password2
    ) {

      const username = String(this.username.value);
      const payload = { password: this.password.value };

      this.authService.updatePassword(username, payload)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            if (res && !res.error) {
              this.snackBar.open(res.message, 'Chiudi', {
                duration: 2000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
              });
              this.router.navigate(['/login']);
            }
          },
          error: () => {
            this.snackBar.open('Impossibile aggiornare la password', 'Chiudi', {
              duration: 2000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
          }
        });
    }
  }

  get username(): FormControl {
    return this.form.get('username') as FormControl;
  }

  get password(): FormControl {
    return this.form.get('password') as FormControl;
  }

  get password2(): FormControl {
    return this.form.get('password2') as FormControl;
  }
}
