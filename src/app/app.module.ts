import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';


import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
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
import { WarnDialogComponent } from './components/warn-dialog/warn-dialog.component';
import { AddFornitoreDialogComponent } from './components/add-fornitore-dialog/add-fornitore-dialog.component';
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { UserListComponent } from './components/users/user-list/user-list.component';
import { UserDetailComponent } from './components/users/user-detail/user-detail.component';
import { RoleComponent } from './components/role/role.component';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule} from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {MatMomentDateModule, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter} from '@angular/material-moment-adapter';
import { OrdineClienteNoteDialogComponent } from './components/ordine-cliente-note-dialog/ordine-cliente-note-dialog.component';
import { AggiungiOAFDialogComponent } from './components/ordine-fornitore/aggiungi-oafdialog/aggiungi-oafdialog.component';
import {MatSortModule} from "@angular/material/sort";
import {MatSelectModule} from "@angular/material/select";
import { ListaComponent } from './components/ordine-cliente/logistica/lista/lista.component';
import { ListaBollaComponent } from './components/ordine-cliente/logistica/lista-bolla/lista-bolla.component';
import { AccontoDialogComponent } from './components/ordine-cliente/logistica/acconto-dialog/acconto-dialog.component';
import { BoxDocciaComponent } from './components/box-doccia/box-doccia.component';
import { SchedeTecnicheComponent } from './components/ordine-cliente/schede-tecniche/schede-tecniche.component';
import {ForbiddenInterceptor} from "./providers/forbidden.interceptor";
import { AmmortamentoComponent } from './components/cespite/ammortamenti/ammortamento.component';
import { RiservatoMagazzinoComponent } from './components/riservato-magazzino/riservato-magazzino.component';
import { CespiteComponent } from './components/cespite/cespite/cespite.component';
import { PrimanotaComponent } from './components/primanota/primanota.component';
import { TipocespiteDialogComponent } from './components/tipo-cespite/tipocespite-dialog/tipocespite-dialog.component';
import { TipoCespiteListComponent } from './components/tipo-cespite/tipo-cespite-list/tipo-cespite-list.component';
import { TipoCespiteDetailComponent } from './components/tipo-cespite/tipo-cespite-detail/tipo-cespite-detail.component';
import { CespiteDialogComponent } from './components/cespite/cespite-dialog/cespite-dialog.component';
import { CollegaOAFDialogComponent } from './components/collega-oaf-dialog/collega-oaf-dialog.component';
import { OafMonitorComponent } from './components/ordine-fornitore/oaf-monitor/oaf-monitor.component';
import { ArticoloClasseFornitoreComponent } from './components/ordine-cliente/articolo-classe-fornitore/articolo-classe-fornitore.component';
import { OrdiniClientiPregressiDialogComponent } from './components/ordine-cliente/logistica/ordini-clienti-pregressi-dialog/ordini-clienti-pregressi-dialog.component';
import { FidoClienteComponent } from './components/ordine-cliente/logistica/fido-cliente/fido-cliente.component';
import { ListaCarichiComponent } from './components/lista-carichi/lista-carichi.component';
import { ListaCarichiDettaglioComponent } from './components/lista-carichi-dettaglio/lista-carichi-dettaglio.component';
import { DepositoComponent } from './components/deposito/deposito.component';
import {ListaCarichiInviatiComponent} from "./components/lista-carichi-inviati/lista-carichi-inviati.component";
import { AggiornaDataConsegnaDialogComponent } from './components/aggiorna-data-consegna-dialog/aggiorna-data-consegna-dialog.component';
import {MatExpansionModule} from "@angular/material/expansion";

export function tokenGetter() {
  return localStorage.getItem("access_token");
}

export const DateFormats = {
  parse: {
    dateInput: ['DD/MM/YYYY']
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};


@NgModule({
  declarations: [
    AppComponent, LoginComponent, NavigationComponent, OrdineClienteComponent,
    ArticoloComponent, SnackbarComponent, FirmaDialogComponent, InviaEmailComponent,
    HistoryDialogComponent, ConfirmDialogComponent, OafListComponent, OafDettaglioComponent,
    WarnDialogComponent, AddFornitoreDialogComponent, ResetPasswordComponent, UserListComponent,
    UserDetailComponent,
    RoleComponent,
    OrdineClienteNoteDialogComponent,
    AggiungiOAFDialogComponent,
    ListaComponent,
    ListaBollaComponent,
    AccontoDialogComponent,
    BoxDocciaComponent,
    SchedeTecnicheComponent,
    AmmortamentoComponent,
    RiservatoMagazzinoComponent,
    CespiteComponent,
    PrimanotaComponent,
    TipocespiteDialogComponent,
    TipoCespiteListComponent,
    TipoCespiteDetailComponent,
    CespiteDialogComponent,
    CollegaOAFDialogComponent,
    OafMonitorComponent,
    ArticoloClasseFornitoreComponent,
    OrdiniClientiPregressiDialogComponent,
    FidoClienteComponent,
    ListaCarichiComponent,
    ListaCarichiInviatiComponent,
    ListaCarichiDettaglioComponent,
    DepositoComponent,
    AggiornaDataConsegnaDialogComponent
  ],
    imports: [
        MatDatepickerModule,
        MatMomentDateModule,
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
                allowedDomains: ['localhost:8080', 'localhost:8081', 'localhost:8082', 'localhost:8083',
                    '192.168.1.126:8080', '192.168.1.126:8181', '192.168.1.126:8082', '192.168.1.126:8083',
                    '192.168.1.60:8080', '192.168.1.60:8081', '192.168.1.60:8082', '192.168.1.60:8083',
                    '192.168.1.56:8080', '192.168.1.56:8081', '192.168.1.56:8082', '192.168.1.56:8083']
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
        MatMenuModule,
        MatAutocompleteModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatMomentDateModule,
        MatSortModule,
        MatSelectModule,
        MatExpansionModule
    ],
  providers: [
    { provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy},
    {provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
    { provide: MAT_DATE_FORMATS, useValue: DateFormats},
    { provide: MAT_DATE_LOCALE, useValue: 'it-IT'},
    { provide: HTTP_INTERCEPTORS, useClass: ForbiddenInterceptor, multi: true,
    }
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
