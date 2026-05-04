import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { PropositionService } from '../../core/services/proposition.service';

@Component({
  selector: 'app-propositions',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './propositions.component.html',
  styleUrl: './propositions.component.css'
})
export class PropositionsComponent implements OnInit {

  proposition = {
    description: '',
    typeProposition: '',
    departement: null as any
  };

  metiers: any[] = [];
  departements: any[] = [];
  selectedIdMetier: number | null = null;

  errorMessage = '';
  successMessage = '';
  loading = false;

  constructor(private propositionService: PropositionService, private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('http://localhost:8082/Api/metier').subscribe(data => {
      this.metiers = data;
    });
  }

  onMetierChange(): void {
    if (this.selectedIdMetier) {
      this.http.get<any[]>(`http://localhost:8082/Api/departements/par-metier/${this.selectedIdMetier}`)
        .subscribe(data => {
          this.departements = data;
          this.proposition.departement = null;
        });
    } else {
      this.departements = [];
    }
  }

  submit() {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.propositionService.save(this.proposition).subscribe({
      next: () => {
        this.successMessage = 'Proposition soumise avec succès !';
        this.loading = false;
        this.proposition = { description: '', typeProposition: '', departement: null };
        this.selectedIdMetier = null;
        this.departements = [];
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la soumission !';
        this.loading = false;
      }
    });
  }
}