import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { RequeteService } from '../../core/services/requete.service';

@Component({
  selector: 'app-requetes',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './requetes.component.html',
  styleUrl: './requetes.component.css'
})
export class RequetesComponent {

  requete = {
    description: '',
    typeRequete: ''
  };

  errorMessage = '';
  successMessage = '';
  loading = false;

  constructor(private requeteService: RequeteService) {}

  submit() {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.requeteService.save(this.requete).subscribe({
      next: (_response : any) => {
        this.successMessage = 'Requête soumise avec succès !';
        this.loading = false;
        this.requete = { description: '', typeRequete: '' };
      },
      error: (_err : any) => {
        this.errorMessage = 'Erreur lors de la soumission !';
        this.loading = false;
      }
    });
  }
}