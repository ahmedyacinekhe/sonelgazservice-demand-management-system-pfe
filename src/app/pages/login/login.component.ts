import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService, LoginResult } from '../../core/services/auth.service';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { SocialAuthService, GoogleLoginProvider, SocialLoginModule, GoogleSigninButtonModule } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SocialLoginModule, GoogleSigninButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  credentials = { email: '', password: '' };
  errorMessage = '';
  loading = false;
  currentYear = new Date().getFullYear();
  showLoginForm = false;
  showGoogleModal = false;
googleNewUser: any = null;
googleTypeChoisi = '';
googleForm: any = {
  nomUtil: '', prenomUtil: '', numTel: '', adresseClient: '',
  codePostal: '', typeClient: 'PARTICULIER',
  matricule: '', nomDepartement: '', dateEmbauche: ''
};
googleFormError = '';
googleFormLoading = false;
departements: any[] = [];
  showChoixModal = false;

  private baseUrl = 'http://localhost:8082';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private socialAuthService: SocialAuthService,
    private http: HttpClient
  ) {
    this.route.queryParams.subscribe(params => {
      if (params['showForm'] === 'true') {
        this.showLoginForm = true;
      }
    });
  }

  ngOnInit() {
  this.socialAuthService.authState.subscribe((user) => {
    if (user) {
      this.http.post<any>(`${this.baseUrl}/auth/google`, { token: user.idToken })
        .subscribe({
          next: (response) => {
            if (response.newUser) {
              this.googleNewUser = { email: response.email, prenom: response.prenom, nom: response.nom };
              this.googleForm.prenomUtil = response.prenom || '';
              this.googleForm.nomUtil = response.nom || '';
              this.showGoogleModal = true;
            } else {
              this.authService.saveToken(response.token);
              this.authService.saveRole(response.role);
              this.authService.savePermissions(response.permissions || []);
             if (response.role === 'ADMIN') {
  this.router.navigate(['/dashboard-admin']);
} else {
  this.router.navigate(['/dashboard']);
}
            }
          },
          error: () => { this.errorMessage = 'Erreur lors de la connexion avec Google.'; }
        });
    }
  });
}

  goHome() {
    this.showLoginForm = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  scrollToForm() {
    this.showLoginForm = true;
    setTimeout(() => {
      const el = document.querySelector('.login-form-card');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

 

  login() {
    this.loading = true;
    this.errorMessage = '';

    const credentials = {
      email: this.credentials.email,
      password: this.credentials.password
    };

    this.authService.login(credentials).subscribe({
      next: (response: LoginResult) => {
        this.loading = false;
        if ((response as any).error === 'COMPTE_INACTIF') {
          this.errorMessage = 'Votre compte est désactivé.';
          return;
        }
        if (!response.token?.trim()) {
          this.errorMessage = 'Token manquant dans la réponse backend.';
          return;
        }
        this.authService.saveToken(response.token);
        this.authService.saveRole(response.role);
        this.authService.savePermissions(response.permissions || []);
        if (response.role === 'ADMIN') {
          this.router.navigate(['/dashboard-admin']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        if (err.status === 403) {
          this.errorMessage = 'Votre compte est désactivé.';
        } else {
          this.errorMessage = 'Email ou mot de passe incorrect';
        }
      }
    });
  }
  choisirTypeGoogle(type: string) {
  this.googleTypeChoisi = type;
  if (type === 'EMPLOYE') {
    this.http.get<any[]>('http://localhost:8082/Api/departements').subscribe({
      next: (d) => this.departements = d,
      error: () => {}
    });
  }
}

soumettreGoogleForm() {
  this.googleFormError = '';
  if (!this.googleTypeChoisi) { this.googleFormError = 'Choisissez un type.'; return; }
  if (!this.googleForm.numTel) { this.googleFormError = 'Téléphone obligatoire.'; return; }
  if (this.googleTypeChoisi === 'CLIENT' && !this.googleForm.adresseClient) { this.googleFormError = 'Adresse obligatoire.'; return; }
  if (this.googleTypeChoisi === 'EMPLOYE' && !this.googleForm.nomDepartement) { this.googleFormError = 'Département obligatoire.'; return; }

  this.googleFormLoading = true;
  const body = {
    type: this.googleTypeChoisi,
    emailUtil: this.googleNewUser.email,
    nomUtil: this.googleForm.nomUtil || this.googleNewUser.nom,
    prenomUtil: this.googleForm.prenomUtil || this.googleNewUser.prenom,
    numTel: this.googleForm.numTel,
    adresseClient: this.googleForm.adresseClient,
    codePostal: this.googleForm.codePostal,
    typeClient: this.googleForm.typeClient,
    matricule: this.googleForm.matricule,
    nomDepartement: this.googleForm.nomDepartement,
    dateEmbauche: this.googleForm.dateEmbauche
  };

  this.http.post<any>('http://localhost:8082/auth/google/complete', body).subscribe({
    next: (response) => {
      this.googleFormLoading = false;
      this.showGoogleModal = false;
      this.authService.saveToken(response.token);
      this.authService.saveRole(response.role);
      this.authService.savePermissions(response.permissions || []);
      if (response.role === 'ADMIN') {
  this.router.navigate(['/dashboard-admin']);
} else {
  this.router.navigate(['/dashboard']);
}
    },
    error: (err) => {
      this.googleFormLoading = false;
      this.googleFormError = err.error || 'Erreur lors de la création du compte.';
    }
  });
}
}