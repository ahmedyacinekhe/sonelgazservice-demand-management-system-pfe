import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { PropositionsComponent } from './pages/propositions/propositions.component';
import { RequetesComponent } from './pages/requetes/requetes.component';
import { ReclamationsComponent } from './pages/reclamations/reclamations.component';
import { RegisterEmployeComponent } from './pages/register-employe/register-employe.component';
import { RegisterClientComponent } from './pages/register-client/register-client.component';
import { ProfilComponent } from './pages/profil/profil.component';
import { DemandesComponent } from './pages/demandes/demandes.component';
import { HistoriqueComponent } from './pages/historique/historique.component';
import { ReclamationsListeComponent } from './pages/reclamations-liste/reclamations-liste.component';
import { RequetesListeComponent } from './pages/requetes-liste/requetes-liste.component';
import { PropositionsListeComponent } from './pages/propositions-liste/propositions-liste.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DashboardAdminComponent } from './pages/dashboard-admin/dashboard-admin.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'dashboard-admin', component: DashboardAdminComponent, canActivate: [authGuard] },
  { path: 'propositions', component: PropositionsComponent, canActivate: [authGuard] },
  { path: 'requetes', component: RequetesComponent, canActivate: [authGuard] },
  { path: 'reclamations', component: ReclamationsComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'register-employe', component: RegisterEmployeComponent },
  { path: 'register-client', component: RegisterClientComponent },
  { path: 'profil', component: ProfilComponent, canActivate: [authGuard] },
  { path: 'demandes', component: DemandesComponent, canActivate: [authGuard] },
  { path: 'historique', component: HistoriqueComponent, canActivate: [authGuard] },
  { path: 'propositions/liste', component: PropositionsListeComponent, canActivate: [authGuard] },
  { path: 'requetes/liste', component: RequetesListeComponent, canActivate: [authGuard] },
  { path: 'reclamations/liste', component: ReclamationsListeComponent, canActivate: [authGuard] },
  { path: 'dashboard-responsable', redirectTo: 'dashboard', pathMatch: 'full' }
];