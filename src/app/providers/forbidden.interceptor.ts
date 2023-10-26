import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {MatSnackBar} from "@angular/material/snack-bar";

@Injectable()
export class ForbiddenInterceptor implements HttpInterceptor {

  constructor(private snackbar: MatSnackBar) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 403) {
          console.error('Accesso vietato! Non hai i permessi per compiere questa azione.');
          this.snackbar.open('Accesso vietato! Non hai i permessi per compiere questa azione.', 'Chiudi', {
            duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
          })
        }
        return throwError(error);
      })
    );
  }
}
