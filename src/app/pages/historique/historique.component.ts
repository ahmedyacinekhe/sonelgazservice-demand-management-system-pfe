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
  toutesLesDemandes: any[] = [];

  // Messages soumission
  messageSoumission: string = '';
  messageType: 'success' | 'info' | 'error' = 'info';

  // Réponse du responsable
  reponseDemande: any = null;
  reponseLoading = false;

  private baseUrl = 'http://localhost:8082';

  constructor(
    private http: HttpClient,
    private requeteService: RequeteService,
    private reclamationService: ReclamationService,
    private propositionService: PropositionService
  ) {}

  ngOnInit() {
    this.chargerHistorique();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  chargerHistorique() {
    this.loading = true;
    this.erreur = '';

    forkJoin({
      requetes:     this.requeteService.getMesDemandes(),
      reclamations: this.reclamationService.getMesDemandes(),
      propositions: this.propositionService.getMesDemandes()
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

  // ===== RÉPONSE DU RESPONSABLE =====

  chargerReponse(demande: any) {
    const id = demande.idDemande;
    if (!id) return;

    this.reponseLoading = true;
    this.reponseDemande = null;

    this.http.get<any[]>(`${this.baseUrl}/Api/reponses/demande/${id}`, { headers: this.getHeaders() })
      .subscribe({
        next: (reponses) => {
          // On prend la dernière réponse si plusieurs existent
          this.reponseDemande = reponses && reponses.length > 0
            ? reponses[reponses.length - 1]
            : null;
          this.reponseLoading = false;
        },
        error: () => {
          this.reponseDemande = null;
          this.reponseLoading = false;
        }
      });
  }

  // ===== FILTRAGE =====

  demandesFiltrees(): any[] {
    if (this.activeTab === 'tous') return this.toutesLesDemandes;
    return this.toutesLesDemandes.filter(d => d.typeDemande === this.activeTab);
  }

  // ===== STATUT =====

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

  // ===== TYPE =====

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

  // ===== HELPERS =====

  getDemandeId(d: any): number {
    return d.idDemande || d.id || 0;
  }

  estBrouillon(demande: any): boolean {
    return (demande.statut || '').toUpperCase() === 'BROUILLON';
  }

  countType(type: string): number {
    return this.toutesLesDemandes.filter(d => d.typeDemande === type).length;
  }

  // ===== MODAL DÉTAIL =====

  voirDetail(demande: any) {
    this.selectedDemande = demande;
    this.messageSoumission = '';
    this.reponseDemande = null;
    this.chargerReponse(demande);
  }

  fermerDetail() {
    this.selectedDemande = null;
    this.messageSoumission = '';
    this.reponseDemande = null;
    this.reponseLoading = false;
  }

  // ===== SOUMISSION =====

  soumettreBrouillon(demande: any) {
    this.messageSoumission = '✅ Votre demande est soumise en tant que brouillon. Vous pouvez la modifier quand vous voulez.';
    this.messageType = 'success';
  }

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

  // ===== SUPPRESSION =====

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
}
