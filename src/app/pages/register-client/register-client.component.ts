import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register-client',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register-client.component.html',
  styleUrl: './register-client.component.css'
})
export class RegisterClientComponent {

  client = {
    nomUtil: '',
    prenomUtil: '',
    emailUtil: '',
    motDePasse: '',
    numTel: 0,
    codePostal: 0,
    adresseClient: '',
    typeClient: ''
  };

  confirmerMotDePasse = '';
  errorMessage = '';
  successMessage = '';
  loading = false;
  currentYear = new Date().getFullYear(); // ← AJOUTÉ

  constructor(private http: HttpClient, private router: Router) {}

  scrollToAnchor(id: string) { // ← AJOUTÉ
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  register() {
    if (this.client.motDePasse !== this.confirmerMotDePasse) {
      this.errorMessage = 'Les mots de passe ne correspondent pas !';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http.post('http://localhost:8082/auth/register/client', this.client,
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