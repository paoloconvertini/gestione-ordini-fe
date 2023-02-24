import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';


import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavigationComponent } from './components/navigation/navigation.component';
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule, MatIconRegistry} from "@angular/material/icon";
import { LoginComponent } from './components/login/login.component';
import {MatCardModule} from "@angular/material/card";
import {MatFormFieldModule} from "@angular/material/form-field";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {MatInputModule} from "@angular/material/input";
import { DashboardComponent } from './components/dashboard/dashboard.component';
import {JwtModule} from "@auth0/angular-jwt";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import { OrdineClienteComponent } from './components/ordine-cliente/ordine-cliente-list/ordine-cliente.component';
import { ArticoloComponent } from './components/articolo/articolo.component';
import {MatDialogModule} from "@angular/material/dialog";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatPaginatorIntl, MatPaginatorModule} from "@angular/material/paginator";
import { AddOrdineClienteComponent } from './components/ordine-cliente/add-ordine/add-ordine-cliente.component';
import {MatTableModule} from "@angular/material/table";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatTooltipModule} from "@angular/material/tooltip";
import {SnackbarComponent} from "./components/snackbar/snackbar.component";
import { FirmaDialogComponent } from './components/firma-dialog/firma-dialog.component';
import {RouteReuseStrategy} from "@angular/router";
import {CustomRouteReuseStrategy} from "./providers/CustomRouteReuseStrategy";
import { InviaEmailComponent } from './components/invia-email/invia-email.component';

export function tokenGetter() {
  return localStorage.getItem("access_token");
}

@NgModule({
  declarations: [
    AppComponent, LoginComponent, NavigationComponent, DashboardComponent, OrdineClienteComponent,
    ArticoloComponent, AddOrdineClienteComponent, SnackbarComponent, FirmaDialogComponent, InviaEmailComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MatToolbarModule,
        MatIconModule,
        MatCardModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatInputModule,
        MatSnackBarModule,
        MatDialogModule,
        HttpClientModule,
        JwtModule.forRoot({
            config: {
                tokenGetter: tokenGetter,
                allowedDomains: ['localhost:8080']

            }
        }),
        MatProgressSpinnerModule,
        MatPaginatorModule,
        MatTableModule,
        MatCheckboxModule,
        FormsModule,
        MatTooltipModule
    ],
  providers: [
    {provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private readonly iconRegistry: MatIconRegistry) {
    const defaultFontSetClasses = iconRegistry.getDefaultFontSetClass();
    const outlinedFontSetClasses = defaultFontSetClasses
      .filter(fontSetClass => fontSetClass !== 'material-icons')
      .concat(['material-icons-outlined']);
    iconRegistry.setDefaultFontSetClass(...outlinedFontSetClasses);
  }
}
