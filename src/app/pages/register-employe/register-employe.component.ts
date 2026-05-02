import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register-employe',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register-employe.component.html',
  styleUrl: './register-employe.component.css'
})
export class RegisterEmployeComponent {

  employe = {
    nomUtil: '',
    prenomUtil: '',
    emailUtil: '',
    motDePasse: '',
    numTel: 0,
    matricule: 0,
    dateEmbauche: '',
    nomDepartement: ''
  };

  confirmerMotDePasse = '';
  errorMessage = '';
  successMessage = '';
  loading = false;
  currentYear = new Date().getFullYear();

  constructor(private http: HttpClient, private router: Router) {}

  hasUpper(pwd: string): boolean { return /[A-Z]/.test(pwd); }
  hasDigit(pwd: string): boolean { return /\d/.test(pwd); }
  hasSpecial(pwd: string): boolean { return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd); }

  register() {
    const pwd = this.employe.motDePasse;

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,12}$/;

    if (!passwordRegex.test(pwd)) {
      this.errorMessage = 'Le mot de passe doit contenir 8 à 12 caractères, au moins une majuscule, un chiffre et un caractère spécial.';
      return;
    }

    if (pwd !== this.confirmerMotDePasse) {
      this.errorMessage = 'Les mots de passe ne correspondent pas !';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http.post('http://localhost:8082/auth/register/employe', this.employe,
      { responseType: 'text' }
    ).subscribe({
      next: (_response) => {
        this.successMessage = 'Compte créé avec succès !';
        this.loading = false;
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (_err) => {
        this.errorMessage = 'Erreur lors de la création du compte !';
        this.loading = false;
      }
    });
  }
}