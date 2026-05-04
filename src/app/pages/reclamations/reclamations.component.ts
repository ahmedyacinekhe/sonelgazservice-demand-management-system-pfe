import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { ReclamationService } from '../../core/services/reclamation.service';

@Component({
  selector: 'app-reclamations',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './reclamations.component.html',
  styleUrl: './reclamations.component.css'
})
export class ReclamationsComponent implements OnInit {

  reclamation = {
    description: '',
    typeReclamation: '',
    niveauUrgence: '',
    departement: null as any
  };

  metiers: any[] = [];
  departements: any[] = [];
  selectedIdMetier: number | null = null;

  errorMessage = '';
  successMessage = '';
  loading = false;

  constructor(private reclamationService: ReclamationService, private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('http://localhost:8080/Api/metier').subscribe(data => {
      this.metiers = data;
    });
  }

  onMetierChange(): void {
    if (this.selectedIdMetier) {
      this.http.get<any[]>(`http://localhost:8080/Api/departements/par-metier/${this.selectedIdMetier}`)
        .subscribe(data => {
          this.departements = data;
          this.reclamation.departement = null;
        });
    } else {
      this.departements = [];
    }
  }

  submit() {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.reclamationService.save(this.reclamation).subscribe({
      next: (_response: any) => {
        this.successMessage = 'Réclamation soumise avec succès !';
        this.loading = false;
        this.reclamation = { description: '', typeReclamation: '', niveauUrgence: '', departement: null };
        this.selectedIdMetier = null;
        this.departements = [];
      },
      error: (_err: any) => {
        this.errorMessage = 'Erreur lors de la soumission !';
        this.loading = false;
      }
    });
  }
}