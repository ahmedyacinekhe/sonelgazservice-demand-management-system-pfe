import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { RequeteService } from '../../core/services/requete.service';

@Component({
  selector: 'app-requetes-liste',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './requetes-liste.component.html',
  styleUrl: './requetes-liste.component.css'
})
export class RequetesListeComponent implements OnInit {

  requetes: any[] = [];
  selectedRequete: any = null;
  requeteToEdit: any = null;

  constructor(private requeteService: RequeteService) {}

  ngOnInit() {
    this.loadRequetes();
  }

  loadRequetes() {
    this.requeteService.getAll().subscribe({
      next: (data: any) => {
        this.requetes = data;
      },
      error: (_err: any) => {
        console.log('Erreur chargement requêtes');
      }
    });
  }

  voirInfo(requete: any) {
    this.selectedRequete = requete;
  }

  modifier(requete: any) {
    this.requeteToEdit = { ...requete };
  }

  saveModification() {
    this.requeteService.update(this.requeteToEdit.idDemande, this.requeteToEdit).subscribe({
      next: (_response: any) => {
        this.loadRequetes();
        this.requeteToEdit = null;
      },
      error: (_err: any) => {
        console.log('Erreur modification');
      }
    });
  }

  supprimer(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette requête ?')) {
      this.requeteService.delete(id).subscribe({
        next: () => {
          this.loadRequetes();
        },
        error: (_err: any) => {
          console.log('Erreur suppression');
        }
      });
    }
  }
}