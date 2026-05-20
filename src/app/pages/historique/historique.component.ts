import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
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

  messageSoumission: string = '';
  messageType: 'success' | 'info' | 'error' = 'info';

  reponseDemande: any = null;
  reponseLoading = false;

  // ── Mode modification ──
  modeModification = false;
  formModification: any = {};
  departements: any[] = [];
  loadingModif = false;

  // ── Pièce jointe ──
  modePieceJointe = false;
  nouvellePJ: File | null = null;
  nouvellePJNom = '';
  pjError = '';
  pjLoading = false;

  private baseUrl = 'http://localhost:8082';

  constructor(
    private http: HttpClient,
    private router: Router,
    private requeteService: RequeteService,
    private reclamationService: ReclamationService,
    private propositionService: PropositionService
  ) {}

  ngOnInit() { this.chargerHistorique(); }

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
      const r  = (requetes     || []).map((d: any) => ({
        ...d,
        typeDemande: 'REQUETE',
        cheminFichier: d.pieceJointe ? `uploads/${d.pieceJointe}` : null,
        nomFichier:    d.pieceJointe || null
      }));
      const rc = (reclamations || []).map((d: any) => ({
        ...d,
        typeDemande: 'RECLAMATION',
        cheminFichier: d.pieceJointe ? `uploads/${d.pieceJointe}` : null,
        nomFichier:    d.pieceJointe || null
      }));
      const p  = (propositions || []).map((d: any) => ({
        ...d,
        typeDemande: 'PROPOSITION',
        cheminFichier: d.pieceJointe ? `uploads/${d.pieceJointe}` : null,
        nomFichier:    d.pieceJointe || null
      }));

      // Tri initial par ID décroissant (pas encore les statuts)
      this.toutesLesDemandes = [...r, ...rc, ...p].sort((a, b) => {
        const da = new Date(a.dateDemande || a.dateCreation || 0).getTime();
        const db = new Date(b.dateDemande || b.dateCreation || 0).getTime();
        if (da !== db) return db - da;
        return (b.idDemande || 0) - (a.idDemande || 0);
      });

      this.chargerEtats(); // re-triera après avoir les statuts
      this.loading = false;
    },
    error: () => {
      this.erreur = 'Erreur lors du chargement de l\'historique.';
      this.loading = false;
    }
  });
}

 chargerEtats() {
  const appels = this.toutesLesDemandes.map(demande => {
    const id = demande.idDemande;
    if (!id) return new Promise<void>(res => res());

    const service =
      demande.typeDemande === 'REQUETE'     ? this.requeteService :
      demande.typeDemande === 'RECLAMATION' ? this.reclamationService :
                                             this.propositionService;

    return new Promise<void>(resolve => {
      service.getEtat(id).subscribe({
        next: (etat: string) => { demande.statut = etat; resolve(); },
        error: () => { demande.statut = 'INCONNU'; resolve(); }
      });
    });
  });

  Promise.all(appels).then(() => {
  this.toutesLesDemandes = [...this.toutesLesDemandes].sort((a, b) => {
    // 1. Brouillons en premier
    const aB = (a.statut || '').toUpperCase() === 'BROUILLON' ? 0 : 1;
    const bB = (b.statut || '').toUpperCase() === 'BROUILLON' ? 0 : 1;
    if (aB !== bB) return aB - bB;

    // 2. Par date décroissante
    const da = new Date(a.dateDemande || a.dateCreation || 0).getTime();
    const db = new Date(b.dateDemande || b.dateCreation || 0).getTime();
    if (da !== db) return db - da;

    // 3. Même date → plus grand ID en premier
    return (b.idDemande || 0) - (a.idDemande || 0);
  });
});
}

  chargerDepartements() {
    if (this.departements.length > 0) return;
    this.http.get<any[]>(`${this.baseUrl}/Api/departements`, { headers: this.getHeaders() })
      .subscribe({
        next: (deps) => { this.departements = deps || []; },
        error: () => { this.departements = []; }
      });
  }

  chargerReponse(demande: any) {
    const id = demande.idDemande;
    if (!id) return;
    this.reponseLoading = true;
    this.reponseDemande = null;

    this.http.get<any[]>(`${this.baseUrl}/Api/reponses/demande/${id}`, { headers: this.getHeaders() })
      .subscribe({
        next: (reponses) => {
          this.reponseDemande = reponses?.length ? reponses[reponses.length - 1] : null;
          this.reponseLoading = false;
        },
        error: () => { this.reponseDemande = null; this.reponseLoading = false; }
      });
  }

  // ===== FILTRAGE =====

  demandesFiltrees(): any[] {
    if (this.activeTab === 'tous') return this.toutesLesDemandes;
    return this.toutesLesDemandes.filter(d => d.typeDemande === this.activeTab);
  }

  // ===== STATUT / TYPE =====

  getStatutClass(statut: string): string {
    switch ((statut || '').toUpperCase()) {
      case 'BROUILLON':  return 'badge-gray';
      case 'EN_ATTENTE': return 'badge-orange';
      case 'EN_COURS':   return 'badge-blue';
      case 'TRAITE': case 'TRAITEE': case 'ACCEPTE':
      case 'APPROUVE': case 'CLOTUREE': return 'badge-green';
      case 'REJETE': case 'REFUSE': case 'ANNULEE': return 'badge-red';
      default: return 'badge-gray';
    }
  }

  getStatutLabel(statut: string): string {
    switch ((statut || '').toUpperCase()) {
      case 'BROUILLON':  return 'Brouillon';
      case 'EN_ATTENTE': return 'En attente';
      case 'EN_COURS':   return 'En cours';
      case 'TRAITE': case 'TRAITEE': return 'Traité';
      case 'ACCEPTE':    return 'Accepté';
      case 'APPROUVE':   return 'Approuvé';
      case 'REJETE':     return 'Rejeté';
      case 'REFUSE':     return 'Refusé';
      case 'CLOTUREE':   return 'Clôturée';
      case 'ANNULEE':    return 'Annulée';
      default: return statut || '—';
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

  getDemandeId(d: any): number { return d.idDemande || d.id || 0; }

  estBrouillon(demande: any): boolean {
    return (demande?.statut || '').toUpperCase() === 'BROUILLON';
  }

  countType(type: string): number {
    return this.toutesLesDemandes.filter(d => d.typeDemande === type).length;
  }

  // ===== MODAL DÉTAIL =====

  voirDetail(demande: any) {
    this.selectedDemande = demande;
    this.messageSoumission = '';
    this.reponseDemande = null;
    this.modeModification = false;
    this.modePieceJointe = false;
    this.nouvellePJ = null;
    this.nouvellePJNom = '';
    this.pjError = '';
    this.chargerReponse(demande);
  }

  fermerDetail() {
    this.selectedDemande = null;
    this.messageSoumission = '';
    this.reponseDemande = null;
    this.reponseLoading = false;
    this.modeModification = false;
    this.modePieceJointe = false;
    this.nouvellePJ = null;
    this.nouvellePJNom = '';
    this.pjError = '';
  }

  // ===== MODIFICATION =====

  ouvrirModification() {
    this.chargerDepartements();
    this.formModification = {
      description:      this.selectedDemande.description || '',
      typeRequete:      this.selectedDemande.typeRequete || '',
      typeProposition:  this.selectedDemande.typeProposition || '',
      typeReclamation:  this.selectedDemande.typeReclamation || '',
      niveauUrgence:    this.selectedDemande.niveauUrgence || '',
      idDepartement:    this.selectedDemande.departement?.idDepartement || ''
    };
    this.modeModification = true;
    this.messageSoumission = '';
  }

  annulerModification() {
    this.modeModification = false;
    this.messageSoumission = '';
  }

  sauvegarderModification() {
  const id = this.getDemandeId(this.selectedDemande);
  if (!id) return;

  const type = this.selectedDemande.typeDemande;
  const endpoint =
    type === 'REQUETE'     ? `${this.baseUrl}/Api/requetes/${id}` :
    type === 'RECLAMATION' ? `${this.baseUrl}/Api/reclamations/${id}` :
                             `${this.baseUrl}/Api/propositions/${id}`;

  // CRITIQUE : inclure TOUS les champs de la demande existante
  // pour ne pas écraser avec des valeurs null
  const dataObj: any = {
    idDemande:   id,
    description: this.formModification.description,
    dateDemande: this.selectedDemande.dateDemande,
    utilisateur: this.selectedDemande.utilisateur,   // ← conserver l'utilisateur
    pieceJointe: this.selectedDemande.pieceJointe,   // ← conserver la PJ existante
    departement: { idDepartement: Number(this.formModification.idDepartement) }
  };

  if (type === 'REQUETE')     dataObj.typeRequete     = this.formModification.typeRequete;
  if (type === 'PROPOSITION') dataObj.typeProposition = this.formModification.typeProposition;
  if (type === 'RECLAMATION') {
    dataObj.typeReclamation = this.formModification.typeReclamation;
    dataObj.niveauUrgence   = this.formModification.niveauUrgence;
  }

  const formData = new FormData();
  formData.append('data', new Blob([JSON.stringify(dataObj)], { type: 'application/json' }));

  this.loadingModif = true;
  this.http.put<any>(endpoint, formData, { headers: this.getHeaders() }).subscribe({
    next: (res) => {
      // Mettre à jour l'affichage localement
      this.selectedDemande.description    = res.description    || dataObj.description;
      this.selectedDemande.typeRequete     = res.typeRequete     || dataObj.typeRequete;
      this.selectedDemande.typeProposition = res.typeProposition || dataObj.typeProposition;
      this.selectedDemande.typeReclamation = res.typeReclamation || dataObj.typeReclamation;
      this.selectedDemande.niveauUrgence   = res.niveauUrgence   || dataObj.niveauUrgence;

      const dep = this.departements.find(
        d => d.idDepartement == this.formModification.idDepartement
      );
      if (dep) this.selectedDemande.departement = dep;

      // Aussi mettre à jour dans la liste
      const idx = this.toutesLesDemandes.findIndex(
        d => d.idDemande === id && d.typeDemande === type
      );
      if (idx !== -1) this.toutesLesDemandes[idx] = { ...this.selectedDemande };

      this.modeModification  = false;
      this.loadingModif      = false;
      this.messageSoumission = '✅ Demande modifiée avec succès.';
      this.messageType       = 'success';
    },
    error: (err) => {
      console.error('Erreur modification:', err);
      this.loadingModif      = false;
      this.messageSoumission = '❌ Erreur lors de la modification.';
      this.messageType       = 'error';
    }
  });
}

  // ===== PIÈCE JOINTE =====

  ouvrirEditionPJ() {
    this.modePieceJointe = true;
    this.nouvellePJ = null;
    this.nouvellePJNom = '';
    this.pjError = '';
  }

  annulerEditionPJ() {
    this.modePieceJointe = false;
    this.nouvellePJ = null;
    this.nouvellePJNom = '';
    this.pjError = '';
  }

  onFichierChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.pjError = '';
    this.nouvellePJ = null;
    this.nouvellePJNom = '';

    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'image/jpeg', 'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const maxSize = 5 * 1024 * 1024; // 5 Mo

    if (!allowedTypes.includes(file.type)) {
      this.pjError = 'Format non accepté. Utilisez PDF, JPG, PNG, DOC ou DOCX.';
      return;
    }
    if (file.size > maxSize) {
      this.pjError = 'Fichier trop volumineux (max 5 Mo).';
      return;
    }

    this.nouvellePJ = file;
    this.nouvellePJNom = file.name;
  }

  sauvegarderPJ() {
  if (!this.nouvellePJ) return;
  const id = this.getDemandeId(this.selectedDemande);
  if (!id) return;

  const type = this.selectedDemande.typeDemande;
  const endpoint =
    type === 'REQUETE'     ? `${this.baseUrl}/Api/requetes/${id}` :
    type === 'RECLAMATION' ? `${this.baseUrl}/Api/reclamations/${id}` :
                             `${this.baseUrl}/Api/propositions/${id}`;

  // CRITIQUE : conserver tous les champs existants
  const dataObj: any = {
    idDemande:   id,
    description: this.selectedDemande.description,
    dateDemande: this.selectedDemande.dateDemande,
    utilisateur: this.selectedDemande.utilisateur,
    departement: this.selectedDemande.departement
  };

  if (type === 'REQUETE')     dataObj.typeRequete     = this.selectedDemande.typeRequete;
  if (type === 'PROPOSITION') dataObj.typeProposition = this.selectedDemande.typeProposition;
  if (type === 'RECLAMATION') {
    dataObj.typeReclamation = this.selectedDemande.typeReclamation;
    dataObj.niveauUrgence   = this.selectedDemande.niveauUrgence;
  }

  const formData = new FormData();
  formData.append('data',    new Blob([JSON.stringify(dataObj)], { type: 'application/json' }));
  formData.append('fichier', this.nouvellePJ);

  this.pjLoading = true;
  this.http.put<any>(endpoint, formData, { headers: this.getHeaders() }).subscribe({
    next: (res) => {
      // pieceJointe est le nom du champ dans l'entité Java
      const nomPJ = res?.pieceJointe || this.nouvellePJNom;
      this.selectedDemande.pieceJointe   = nomPJ;
      this.selectedDemande.cheminFichier = `uploads/${nomPJ}`;
      this.selectedDemande.nomFichier    = nomPJ;

      // Mettre à jour dans la liste aussi
      const idx = this.toutesLesDemandes.findIndex(
        d => d.idDemande === id && d.typeDemande === type
      );
      if (idx !== -1) {
        this.toutesLesDemandes[idx].pieceJointe   = nomPJ;
        this.toutesLesDemandes[idx].cheminFichier = `uploads/${nomPJ}`;
      }

      this.pjLoading        = false;
      this.modePieceJointe  = false;
      this.nouvellePJ       = null;
      this.nouvellePJNom    = '';
      this.messageSoumission = '✅ Pièce jointe sauvegardée.';
      this.messageType       = 'success';
    },
    error: (err) => {
      console.error('Erreur PJ:', err);
      this.pjLoading = false;
      this.pjError   = 'Erreur lors de l\'envoi du fichier.';
    }
  });
}

  supprimerPJ() {
    if (!confirm('Supprimer la pièce jointe ?')) return;
    const id = this.getDemandeId(this.selectedDemande);
    if (!id) return;

    const type = this.selectedDemande.typeDemande;
    const segment =
      type === 'REQUETE'     ? 'requetes' :
      type === 'RECLAMATION' ? 'reclamations' : 'propositions';

    this.http.delete(
      `${this.baseUrl}/Api/${segment}/${id}/piece-jointe`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.selectedDemande.cheminFichier = null;
        this.selectedDemande.nomFichier    = null;
        this.messageSoumission = '✅ Pièce jointe supprimée.';
        this.messageType = 'success';
      },
      error: () => {
        this.messageSoumission = '❌ Erreur lors de la suppression de la pièce jointe.';
        this.messageType = 'error';
      }
    });
  }

  // ===== SOUMISSION =====

  soumettreBrouillon(demande: any) {
    this.messageSoumission = '✅ Votre demande est sauvegardée en brouillon.';
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
        this.messageSoumission = '✅ Votre demande a été confirmée et envoyée au responsable.';
        this.messageType = 'success';
      },
      error: (err) => {
        if (err.status === 429) {
          this.messageSoumission = '⚠️ Vous avez atteint le maximum de 3 demandes non traitées. Veuillez attendre qu\'elles soient traitées avant d\'en soumettre une nouvelle.';
        } else {
          this.messageSoumission = '❌ Erreur lors de la confirmation.';
        }
        this.messageType = 'error';
      }
    });
  }
  // ===== SUPPRESSION =====

  supprimer(demande: any) {
    const id = this.getDemandeId(demande);
    if (!id) { alert('ID introuvable.'); return; }
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
}