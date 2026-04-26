import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { PropositionService } from '../../core/services/proposition.service';

@Component({
  selector: 'app-propositions-liste',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './propositions-liste.component.html',
  styleUrl: './propositions-liste.component.css'
})
export class PropositionsListeComponent implements OnInit {

  propositions: any[] = [];
  selectedProposition: any = null;
  propositionToEdit: any = null;

  constructor(private propositionService: PropositionService) {}

  ngOnInit() {
    this.loadPropositions();
  }

  loadPropositions() {
    this.propositionService.getAll().subscribe({
      next: (data: any) => {
        this.propositions = data;
      },
      error: (_err: any) => {
        console.log('Erreur chargement propositions');
      }
    });
  }

  voirInfo(proposition: any) {
    this.selectedProposition = proposition;
  }

  modifier(proposition: any) {
    this.propositionToEdit = { ...proposition };
  }

  saveModification() {
    this.propositionService.update(this.propositionToEdit.idDemande, this.propositionToEdit).subscribe({
      next: (_response: any) => {
        this.loadPropositions();
        this.propositionToEdit = null;
      },
      error: (_err: any) => {
        console.log('Erreur modification');
      }
    });
  }

  supprimer(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette proposition ?')) {
      this.propositionService.delete(id).subscribe({
        next: () => {
          this.loadPropositions();
        },
        error: (_err: any) => {
          console.log('Erreur suppression');
        }
      });
    }
  }
}