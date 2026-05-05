import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RequeteService } from '../../core/services/requete.service';
import { ReclamationService } from '../../core/services/reclamation.service';
import { PropositionService } from '../../core/services/proposition.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historique.component.html',
  styleUrl: './historique.component.css'
})
export class HistoriqueComponent implements OnInit {

  activeTab: 'tous' | 'REQUETE' | 'PROPOSITION' | 'RECLAMATION' = 'tous';
  selectedDemande: any = null;
  loading = false;
  erreur = '';

  // Toutes les demandes combinées
  toutesLesDemandes: any[] = [];

  constructor(
    private requeteService: RequeteService,
    private reclamationService: ReclamationService,
    private propositionService: PropositionService
  ) {}

  ngOnInit() {
    this.chargerHistorique();
  }

  chargerHistorique() {
    this.loading = true;
    this.erreur = '';

    // Récupère les 3 types en parallèle
    forkJoin({
      requetes: this.requeteService.getAll(),
      reclamations: this.reclamationService.getAll(),
      propositions: this.propositionService.getAll()
    }).subscribe({
      next: ({ requetes, reclamations, propositions }) => {
        const r = (requetes || []).map((d: any) => ({ ...d, typeDemande: 'REQUETE' }));
        const rc = (reclamations || []).map((d: any) => ({ ...d, typeDemande: 'RECLAMATION' }));
        const p = (propositions || []).map((d: any) => ({ ...d, typeDemande: 'PROPOSITION' }));

        // Trier par date décroissante
        this.toutesLesDemandes = [...r, ...rc, ...p].sort((a, b) => {
          const da = new Date(a.dateCreation || a.dateSoumission || 0).getTime();
          const db = new Date(b.dateCreation || b.dateSoumission || 0).getTime();
          return db - da;
        });
        this.loading = false;
      },
      error: () => {
        this.erreur = 'Erreur lors du chargement de l\'historique.';
        this.loading = false;
      }
    });
  }

  // Filtrer selon l'onglet actif
  demandesFiltrees(): any[] {
    if (this.activeTab === 'tous') return this.toutesLesDemandes;
    return this.toutesLesDemandes.filter(d => d.typeDemande === this.activeTab);
  }

  // Badge couleur selon statut
  getStatutClass(statut: string): string {
    switch ((statut || '').toUpperCase()) {
      case 'EN_ATTENTE':
      case 'EN ATTENTE': return 'badge-orange';
      case 'EN_COURS':
      case 'EN COURS':   return 'badge-blue';
      case 'TRAITE':
      case 'ACCEPTE':
      case 'APPROUVE':   return 'badge-green';
      case 'REJETE':
      case 'REFUSE':     return 'badge-red';
      default:           return 'badge-gray';
    }
  }

  // Libellé statut lisible
  getStatutLabel(statut: string): string {
    switch ((statut || '').toUpperCase()) {
      case 'EN_ATTENTE': return 'En attente';
      case 'EN_COURS':   return 'En cours';
      case 'TRAITE':     return 'Traité';
      case 'ACCEPTE':    return 'Accepté';
      case 'APPROUVE':   return 'Approuvé';
      case 'REJETE':     return 'Rejeté';
      case 'REFUSE':     return 'Refusé';
      default:           return statut || '—';
    }
  }

  // Icône selon type de demande
  getTypeIcon(type: string): string {
    switch (type) {
      case 'REQUETE':     return '📝';
      case 'RECLAMATION': return '📢';
      case 'PROPOSITION': return '📋';
      default:            return '📄';
    }
  }

  // Libellé type lisible
  getTypeLabel(type: string): string {
    switch (type) {
      case 'REQUETE':     return 'Requête';
      case 'RECLAMATION': return 'Réclamation';
      case 'PROPOSITION': return 'Proposition';
      default:            return type || '—';
    }
  }

  // ID de la demande selon le type
  getDemandeId(d: any): number {
    return d.idRequete || d.idReclamation || d.idProposition || d.id || 0;
  }

  voirDetail(demande: any) {
    this.selectedDemande = demande;
  }

  fermerDetail() {
    this.selectedDemande = null;
  }

  supprimer(demande: any) {
    const id = this.getDemandeId(demande);
    if (!confirm('Supprimer cette demande ?')) return;

    const obs =
      demande.typeDemande === 'REQUETE'     ? this.requeteService.delete(id) :
      demande.typeDemande === 'RECLAMATION' ? this.reclamationService.delete(id) :
                                              this.propositionService.delete(id);
    obs.subscribe({
      next: () => {
        this.toutesLesDemandes = this.toutesLesDemandes.filter(d => d !== demande);
        if (this.selectedDemande === demande) this.selectedDemande = null;
      },
      error: () => alert('Erreur lors de la suppression.')
    });
  }
  countType(type: string): number {
  return this.toutesLesDemandes.filter(d => d.typeDemande === type).length;
}
}
