import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  toutesLesDemandes: any[] = [];

  // Messages soumission
  messageSoumission: string = '';
  messageType: 'success' | 'info' | 'error' = 'info';

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

    forkJoin({
      requetes: this.requeteService.getAll(),
      reclamations: this.reclamationService.getAll(),
      propositions: this.propositionService.getAll()
    }).subscribe({
      next: ({ requetes, reclamations, propositions }) => {
        const r  = (requetes     || []).map((d: any) => ({ ...d, typeDemande: 'REQUETE' }));
        const rc = (reclamations || []).map((d: any) => ({ ...d, typeDemande: 'RECLAMATION' }));
        const p  = (propositions || []).map((d: any) => ({ ...d, typeDemande: 'PROPOSITION' }));

        this.toutesLesDemandes = [...r, ...rc, ...p].sort((a, b) => {
          const da = new Date(a.dateDemande || 0).getTime();
          const db = new Date(b.dateDemande || 0).getTime();
          return db - da;
        });

        // Charger l'état de chaque demande
        this.chargerEtats();
        this.loading = false;
      },
      error: () => {
        this.erreur = 'Erreur lors du chargement de l\'historique.';
        this.loading = false;
      }
    });
  }

  chargerEtats() {
    this.toutesLesDemandes.forEach(demande => {
      const id = demande.idDemande;
      if (!id) return;

      const service =
        demande.typeDemande === 'REQUETE'     ? this.requeteService :
        demande.typeDemande === 'RECLAMATION' ? this.reclamationService :
                                               this.propositionService;

      service.getEtat(id).subscribe({
        next: (etat: string) => { demande.statut = etat; },
        error: () => { demande.statut = 'INCONNU'; }
      });
    });
  }

  demandesFiltrees(): any[] {
    if (this.activeTab === 'tous') return this.toutesLesDemandes;
    return this.toutesLesDemandes.filter(d => d.typeDemande === this.activeTab);
  }

  getStatutClass(statut: string): string {
    switch ((statut || '').toUpperCase()) {
      case 'BROUILLON':  return 'badge-gray';
      case 'EN_ATTENTE': return 'badge-orange';
      case 'EN_COURS':   return 'badge-blue';
      case 'TRAITE':
      case 'TRAITEE':
      case 'ACCEPTE':
      case 'APPROUVE':   return 'badge-green';
      case 'REJETE':
      case 'REFUSE':     return 'badge-red';
      case 'CLOTUREE':   return 'badge-green';
      case 'ANNULEE':    return 'badge-red';
      default:           return 'badge-gray';
    }
  }

  getStatutLabel(statut: string): string {
    switch ((statut || '').toUpperCase()) {
      case 'BROUILLON':  return 'Brouillon';
      case 'EN_ATTENTE': return 'En attente';
      case 'EN_COURS':   return 'En cours';
      case 'TRAITE':
      case 'TRAITEE':    return 'Traité';
      case 'ACCEPTE':    return 'Accepté';
      case 'APPROUVE':   return 'Approuvé';
      case 'REJETE':     return 'Rejeté';
      case 'REFUSE':     return 'Refusé';
      case 'CLOTUREE':   return 'Clôturée';
      case 'ANNULEE':    return 'Annulée';
      default:           return statut || '—';
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'REQUETE':     return '📝';
      case 'RECLAMATION': return '📢';
      case 'PROPOSITION': return '📋';
      default:            return '📄';
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'REQUETE':     return 'Requête';
      case 'RECLAMATION': return 'Réclamation';
      case 'PROPOSITION': return 'Proposition';
      default:            return type || '—';
    }
  }

  getDemandeId(d: any): number {
    return d.idDemande || d.id || 0;
  }

  estBrouillon(demande: any): boolean {
    return (demande.statut || '').toUpperCase() === 'BROUILLON';
  }

  voirDetail(demande: any) {
    this.selectedDemande = demande;
    this.messageSoumission = '';
  }

  fermerDetail() {
    this.selectedDemande = null;
    this.messageSoumission = '';
  }

  // ✅ Soumettre en brouillon (déjà fait automatiquement, juste afficher message)
  soumettreBrouillon(demande: any) {
    this.messageSoumission = '✅ Votre demande est soumise en tant que brouillon. Vous pouvez la modifier quand vous voulez.';
    this.messageType = 'success';
  }

  // ✅ Confirmer la soumission → passer à EN_ATTENTE (id_etat = 2)
  confirmerSoumission(demande: any) {
    const id = this.getDemandeId(demande);
    if (!id) return;

    const service =
      demande.typeDemande === 'REQUETE'     ? this.requeteService :
      demande.typeDemande === 'RECLAMATION' ? this.reclamationService :
                                             this.propositionService;

    service.confirmerSoumission(id).subscribe({
      next: () => {
        demande.statut = 'EN_ATTENTE';
        this.messageSoumission = '🔒 Votre demande a été confirmée. Vous ne pouvez plus la modifier.';
        this.messageType = 'info';
      },
      error: () => {
        this.messageSoumission = '❌ Erreur lors de la confirmation.';
        this.messageType = 'error';
      }
    });
  }

  supprimer(demande: any) {
    const id = this.getDemandeId(demande);
    if (!id || id === 0) {
      alert('ID introuvable, impossible de supprimer.');
      return;
    }
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
      error: (err) => {
        console.error('Erreur suppression:', err);
        alert('Erreur lors de la suppression.');
      }
    });
  }

  countType(type: string): number {
    return this.toutesLesDemandes.filter(d => d.typeDemande === type).length;
  }
}