import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { ReclamationService } from '../../core/services/reclamation.service';

@Component({
  selector: 'app-reclamations',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './reclamations.component.html',
  styleUrl: './reclamations.component.css'
})
export class ReclamationsComponent {

  reclamation = {
    description: '',
    typeReclamation: '',
    niveauUrgence: ''
  };

  errorMessage = '';
  successMessage = '';
  loading = false;

  constructor(private reclamationService: ReclamationService) {}

  submit() {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.reclamationService.save(this.reclamation).subscribe({
      next: (_response: any) => {
        this.successMessage = 'Réclamation soumise avec succès !';
        this.loading = false;
        this.reclamation = { description: '', typeReclamation: '', niveauUrgence: '' };
      },
      error: (_err: any) => {
        this.errorMessage = 'Erreur lors de la soumission !';
        this.loading = false;
      }
    });
  }
}
