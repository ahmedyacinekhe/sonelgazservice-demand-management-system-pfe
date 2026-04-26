import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { PropositionService } from '../../core/services/proposition.service';

@Component({
  selector: 'app-propositions',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './propositions.component.html',
  styleUrl: './propositions.component.css'
})
export class PropositionsComponent {

  proposition = {
    description: '',
    typeProposition: ''
  };

  errorMessage = '';
  successMessage = '';
  loading = false;

  constructor(private propositionService: PropositionService) {}

  submit() {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.propositionService.save(this.proposition).subscribe({
      next: (response) => {
        this.successMessage = 'Proposition soumise avec succès !';
        this.loading = false;
        this.proposition = { description: '', typeProposition: '' };
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la soumission !';
        this.loading = false;
      }
    });
  }
}