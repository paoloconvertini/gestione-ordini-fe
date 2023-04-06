import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';


import {HttpClientModule} from '@angular/common/http';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NavigationComponent} from './components/navigation/navigation.component';
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule, MatIconRegistry} from "@angular/material/icon";
import {LoginComponent} from './components/login/login.component';
import {MatCardModule} from "@angular/material/card";
import {MatFormFieldModule} from "@angular/material/form-field";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {MatInputModule} from "@angular/material/input";
import {JwtModule} from "@auth0/angular-jwt";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {OrdineClienteComponent} from './components/ordine-cliente/ordine-cliente-list/ordine-cliente.component';
import {ArticoloComponent} from './components/ordine-cliente/articolo/articolo.component';
import {MatDialogModule} from "@angular/material/dialog";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatTableModule} from "@angular/material/table";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatTooltipModule} from "@angular/material/tooltip";
import {SnackbarComponent} from "./components/snackbar/snackbar.component";
import {FirmaDialogComponent} from './components/firma-dialog/firma-dialog.component';
import {RouteReuseStrategy} from "@angular/router";
import {CustomRouteReuseStrategy} from "./providers/CustomRouteReuseStrategy";
import {InviaEmailComponent} from './components/invia-email/invia-email.component';
import {HistoryDialogComponent} from './components/history-dialog/history-dialog.component';
import {MatGridListModule} from "@angular/material/grid-list";
import {MatRadioModule} from "@angular/material/radio";
import {ConfirmDialogComponent} from './components/confirm-dialog/confirm-dialog.component';
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatMenuModule} from "@angular/material/menu";
import {OafListComponent} from './components/ordine-fornitore/oaf-list/oaf-list.component';
import {OafDettaglioComponent} from './components/ordine-fornitore/oaf-dettaglio/oaf-dettaglio.component';


export function tokenGetter() {
  return localStorage.getItem("access_token");
}

@NgModule({
  declarations: [
    AppComponent, LoginComponent, NavigationComponent, OrdineClienteComponent,
    ArticoloComponent, SnackbarComponent, FirmaDialogComponent, InviaEmailComponent, HistoryDialogComponent, ConfirmDialogComponent, OafListComponent, OafDettaglioComponent
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
        allowedDomains: ['localhost:8080', '192.168.1.150:8080', '192.168.1.60:8080']
      }
    }),
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatTableModule,
    MatCheckboxModule,
    FormsModule,
    MatTooltipModule,
    MatGridListModule,
    MatRadioModule,
    MatSidenavModule,
    MatMenuModule
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
