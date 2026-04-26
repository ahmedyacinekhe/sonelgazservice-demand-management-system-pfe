import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService, LoginResult } from '../../core/services/auth.service';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  credentials = { email: '', password: '' };
  errorMessage = '';
  loading = false;
  currentYear = new Date().getFullYear();
  showLoginForm = false;
  showChoixModal = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe(params => {
      if (params['showForm'] === 'true') {
        this.showLoginForm = true;
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

    // ← CORPS SIMPLIFIÉ : email + password uniquement
    const credentials = {
      email: this.credentials.email,
      password: this.credentials.password
    };

    this.authService.login(credentials).subscribe({
      next: (response: LoginResult) => {
        this.loading = false;
        console.log('=== RESPONSE ===', response);

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
        console.log('=== ERREUR ===', err.status, err.error);

        if (err.status === 0) {
          this.errorMessage = 'Serveur inaccessible — vérifiez que le backend tourne sur localhost:8082';
        } else if (err.status === 401 || err.status === 403) {
          this.errorMessage = 'Email ou mot de passe incorrect';
        } else if (err.status === 404) {
          this.errorMessage = 'Route /auth/login introuvable';
        } else if (err.status >= 500) {
          this.errorMessage = 'Erreur serveur — réessayez plus tard';
        } else {
          this.errorMessage = 'Email ou mot de passe incorrect';
        }
      }
    });
  }
}