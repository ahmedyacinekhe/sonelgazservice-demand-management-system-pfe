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
  currentYear = new Date().getFullYear(); // ← AJOUTÉ

  constructor(private http: HttpClient, private router: Router) {}

  register() {
    if (this.employe.motDePasse !== this.confirmerMotDePasse) {
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