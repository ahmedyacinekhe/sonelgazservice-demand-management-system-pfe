import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './historique.component.html',
  styleUrl: './historique.component.css'
})
export class HistoriqueComponent implements OnInit {

  activeTab = 'en_cours';
  selectedDemande: any = null;

  demandesEnCours: any[] = [];
  demandesTraitees: any[] = [];
  demandesRejetees: any[] = [];

  ngOnInit() {
    // on connectera avec le backend plus tard
  }

  getDemandes(): any[] {
    if (this.activeTab === 'en_cours') return this.demandesEnCours;
    if (this.activeTab === 'traite') return this.demandesTraitees;
    return this.demandesRejetees;
  }

  voirInfo(demande: any) {
    this.selectedDemande = demande;
  }

  modifier(demande: any) {
    console.log('Modifier', demande);
  }

  supprimer(id: number) {
    if (confirm('Supprimer cette demande ?')) {
      console.log('Supprimer', id);
    }
  }
}