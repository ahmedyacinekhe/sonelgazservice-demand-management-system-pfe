import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { RequeteService } from '../../core/services/requete.service';

@Component({
  selector: 'app-requetes',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './requetes.component.html',
  styleUrl: './requetes.component.css'
})
export class RequetesComponent implements OnInit {

  requete = {
    description: '',
    typeRequete: '',
    departement: null as any
  };

  metiers: any[] = [];
  departements: any[] = [];
  selectedIdMetier: number | null = null;

  errorMessage = '';
  successMessage = '';
  loading = false;

  constructor(private requeteService: RequeteService, private http: HttpClient) {}

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
          this.requete.departement = null;
        });
    } else {
      this.departements = [];
    }
  }

  submit() {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.requeteService.save(this.requete).subscribe({
      next: (_response: any) => {
        this.successMessage = 'Requête soumise avec succès !';
        this.loading = false;
        this.requete = { description: '', typeRequete: '', departement: null };
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