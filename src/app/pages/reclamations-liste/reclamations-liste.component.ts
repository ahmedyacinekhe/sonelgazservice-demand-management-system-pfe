import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { ReclamationService } from '../../core/services/reclamation.service';

@Component({
  selector: 'app-reclamations-liste',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './reclamations-liste.component.html',
  styleUrl: './reclamations-liste.component.css'
})
export class ReclamationsListeComponent implements OnInit {

  reclamations: any[] = [];
  selectedReclamation: any = null;
  reclamationToEdit: any = null;

  constructor(private reclamationService: ReclamationService) {}

  ngOnInit() {
    this.loadReclamations();
  }

  loadReclamations() {
    this.reclamationService.getAll().subscribe({
      next: (data: any) => {
        this.reclamations = data;
      },
      error: (_err: any) => {
        console.log('Erreur chargement réclamations');
      }
    });
  }

  voirInfo(reclamation: any) {
    this.selectedReclamation = reclamation;
  }

  modifier(reclamation: any) {
    this.reclamationToEdit = { ...reclamation };
  }

  saveModification() {
    this.reclamationService.update(
      this.reclamationToEdit.idDemande, 
      this.reclamationToEdit
    ).subscribe({
      next: (_response: any) => {
        this.loadReclamations();
        this.reclamationToEdit = null;
      },
      error: (_err: any) => {
        console.log('Erreur modification');
      }
    });
  }

  supprimer(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette réclamation ?')) {
      this.reclamationService.delete(id).subscribe({
        next: () => {
          this.loadReclamations();
        },
        error: (_err: any) => {
          console.log('Erreur suppression');
        }
      });
    }
  }
}