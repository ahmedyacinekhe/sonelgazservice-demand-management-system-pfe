import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RequeteService } from '../../core/services/requete.service';
import { ReclamationService } from '../../core/services/reclamation.service';
import { PropositionService } from '../../core/services/proposition.service';
import { AuthService } from '../../core/services/auth.service';
import { HistoriqueComponent } from '../historique/historique.component';
import { SocialAuthService, SocialLoginModule } from '@abacritt/angularx-social-login';
import { NotificationService, AppNotification } from '../../core/services/notification.service';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HistoriqueComponent, SocialLoginModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {

  activeSection = 'home';
  sidebarOpen = true;
  profileMenuOpen = false;
  currentYear = new Date().getFullYear();

  nomUtilisateur        = '';
  prenomUtilisateur     = '';
  nomFamilleUtilisateur = '';
  emailUtilisateur      = '';
  telUtilisateur        = '';
  roleUtilisateur       = '';
  profilExtra: any      = null;

  mdp = { ancien: '', nouveau: '', confirmer: '' };
  showMdpAncien = false;
showMdpNouveau = false;
showMdpConfirmer = false;
  langueSelectionnee = 'fr';
  notifEmail = true;
  get currentUserKey() {
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
  return 'notifApp_' + (user.id || user.email || 'default');
}
notifApp = true;

  demandeTypeSelectionne = '';
  demandeSubmitting = false;
  demandeError = '';
  demandeSuccess = '';
  nouvelleDemande: any = {
    description: '',
    typeRequete: '',
    typeReclamation: '',
    niveauUrgence: '',
    typeProposition: '',
    departement: null
  };

  metiers: any[] = [];
  departementsFiltre: any[] = [];
  selectedIdMetier: number | null = null;
  pieceJointe: File | null = null;

  propositions: any[] = [];
  requetes: any[] = [];
  reclamations: any[] = [];

  selectedProposition: any = null;
  selectedRequete: any = null;
  selectedReclamation: any = null;
  propositionToEdit: any = null;
  requeteToEdit: any = null;
  reclamationToEdit: any = null;

  utilisateurs: any[] = [];
  departements: any[] = [];
  roles: any[] = [];
  permissions: any[] = [];
  rolesUtilisateurs: any[] = [];

  nouveauDepartement  = { nomDepartement: '', descriptionDepartement: '' };
  departementEdite: any = null;
  nouvellePermission  = { nomPermission: '', descriptionPermission: '' };
  permissionEditee: any = null;
  nouveauRole         = { nomRole: '', descriptionRole: '' };
  roleEdite: any      = null;
  affectation         = { idUtil: 0, idRole: 0 };

  isAdmin = false;
  showEmployeMenus = false;
  canTraiterDemandes = false;
  canGererUtilisateurs = false;
  canGererRoles = false;
  canGererPermissions = false;
  canGererDepartements = false;
  showAdministrationBlock = false;

  // ===== NOUVELLES VARIABLES =====
  idDepartementResponsable: number | null = null;
  rechercheDemande = '';
  filtreStatut = '';
  demandeEnCours: any = null;
  nouveauStatut = '';
  reponseTexte = '';
  reponseEnvoyee = false;
  reponseErreur = '';
  editProfil = false;
profilEdit = { prenomUtil: '', nomUtil: '', numTel: '' };
matricule = '';
dateEmbauche = '';
nomDepartement = '';
notifications: AppNotification[] = [];
notifOpen = false;
private pollingInterval: any;
private dernierStatuts: Record<string, string> = {};
private idMaxDemande = 0;

  private baseUrl = 'http://localhost:8082';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private requeteService: RequeteService,
    private reclamationService: ReclamationService,
   private propositionService: PropositionService,
private socialAuthService: SocialAuthService,
private notifService: NotificationService
  ) {}

  ngOnInit() {
    this.refreshAccessFlags();
    this.loadMetiers();
    this.normalizeActiveSection();
    if (this.showAdministrationBlock) {
      this.loadAll();
    }
    this.loadCurrentUser();
    this.http.get<any>(`${this.baseUrl}/Api/utilisateurs/me/preferences`, { headers: this.getHeaders() })
  .subscribe({
    next: (prefs) => {
      this.notifApp = prefs.notifApp !== false;
      localStorage.setItem(this.currentUserKey, String(this.notifApp));
      this.cdr.detectChanges();
    },
    error: () => {
      // fallback localStorage
      this.notifApp = localStorage.getItem(this.currentUserKey) !== 'false';
    }
  });
    this.chargerDepartementResponsable();
    this.chargerNotifications();
    this.http.get<any>(`${this.baseUrl}/Api/utilisateurs/me/preferences`, { headers: this.getHeaders() })
  .subscribe({
    next: (prefs) => {
      this.notifApp = prefs.notifApp !== false;
      this.cdr.detectChanges();
    },
    error: () => {
      this.notifApp = true;
    }
  });
    
  }

  normalizeActiveSection(): void {
    const s = this.activeSection;
    if (!this.showEmployeMenus && !this.canTraiterDemandes && (s === 'demandes' || s === 'historique')) {
      this.activeSection = 'home';
    }
    if (this.isAdmin && s === 'gestion-demandes') {
      this.activeSection = 'home';
    }
    if (s === 'gestion-demandes' && !this.canTraiterDemandes) {
      this.activeSection = 'home';
    }
    if (s === 'utilisateurs' && !this.canGererUtilisateurs) {
      this.activeSection = 'home';
    }
    if (s === 'roles' && !this.canGererRoles) {
      this.activeSection = 'home';
    }
    if (s === 'permissions' && !this.canGererPermissions) {
      this.activeSection = 'home';
    }
    if (s === 'departements' && !this.canGererDepartements) {
      this.activeSection = 'home';
    }
  }

  refreshAccessFlags(): void {
    this.isAdmin = this.authService.isAdminRole();
    this.showEmployeMenus = !this.isAdmin;
    this.canTraiterDemandes =
      !this.isAdmin &&
      (this.authService.hasPermission('TRAITER_DEMANDE') ||
        this.authService.hasPermission('TRAITER_DEMANDES'));
    this.canGererUtilisateurs =
      this.isAdmin || this.authService.hasPermission('GERER_UTILISATEURS');
    this.canGererRoles =
      this.isAdmin || this.authService.hasPermission('GERER_ROLES');
    this.canGererPermissions =
      this.isAdmin || this.authService.hasPermission('GERER_PERMISSIONS');
    this.canGererDepartements =
      this.isAdmin || this.authService.hasPermission('GERER_DEPARTEMENTS');
    this.showAdministrationBlock =
      this.canGererUtilisateurs ||
      this.canGererRoles ||
      this.canGererPermissions ||
      this.canGererDepartements;
    const lr = this.authService.getRole();
    if (lr) {
      this.roleUtilisateur = lr;
    }
  }

  onAvatarError(event: any) {
    event.target.style.display = 'none';
  }

  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }

  closeSidebarMobile() {
    if (window.innerWidth < 900) this.sidebarOpen = false;
  }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  private pickProfileField(obj: any, keys: string[]): string {
    if (!obj) return '';
    for (const k of keys) {
      const v = obj[k];
      if (v === undefined || v === null) continue;
      const s = String(v).trim();
      if (s !== '' && s !== '0') return s;
    }
    return '';
  }

  private isPlainRecord(v: unknown): v is Record<string, unknown> {
    return (
      v !== null &&
      typeof v === 'object' &&
      !Array.isArray(v) &&
      !(v instanceof Date) &&
      Object.getPrototypeOf(v) === Object.prototype
    );
  }

  private flattenProfilePayload(u: any, depth = 0): Record<string, unknown> {
    if (depth > 12 || !this.isPlainRecord(u)) return {};
    let acc: Record<string, unknown> = { ...u };
    for (const v of Object.values(u)) {
      if (this.isPlainRecord(v)) {
        acc = { ...acc, ...this.flattenProfilePayload(v, depth + 1) };
      }
    }
    return acc;
  }

  openProfilSection() {
    this.activeSection = 'profil';
    this.profileMenuOpen = false;
    this.closeSidebarMobile();
    this.loadCurrentUser();
  }

  private applyNomCompletIfNeeded(u: Record<string, unknown>): void {
    if (this.prenomUtilisateur || this.nomFamilleUtilisateur) return;
    const nc = this.pickProfileField(u, [
      'nomComplet', 'nomPrenom', 'fullName', 'displayName', 'libelle'
    ]);
    if (!nc) return;
    const parts = nc.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      this.prenomUtilisateur = parts[0];
      this.nomFamilleUtilisateur = parts.slice(1).join(' ');
    } else if (parts.length === 1) {
      this.prenomUtilisateur = parts[0];
    }
  }

  loadCurrentUser() {
    let jwtPayload: Record<string, unknown> = {};
    const token = localStorage.getItem('token');
    if (token) {
      try {
        jwtPayload = JSON.parse(atob(token.split('.')[1])) as Record<string, unknown>;
        this.emailUtilisateur =
          (jwtPayload['sub'] as string) || (jwtPayload['email'] as string) || '';
        this.roleUtilisateur =
          (jwtPayload['role'] as string) ||
          (Array.isArray(jwtPayload['roles']) ? (jwtPayload['roles'] as string[])[0] : '') ||
          this.authService.getRole() || '';
      } catch { /* ignore */ }
    }
    const role = (this.authService.getRole() || this.roleUtilisateur || '').toUpperCase();
    const url = role === 'CLIENT'
      ? `${this.baseUrl}/Api/clients/me`
      : `${this.baseUrl}/Api/employes/me`;

    this.http.get<any>(url, { headers: this.getHeaders() }).subscribe({
      next: (raw) => {
        this.profilExtra = raw;
        const u = this.flattenProfilePayload(raw);
        this.prenomUtilisateur = this.pickProfileField(u, [
          'prenomUtil', 'prenom', 'prenomClient', 'firstName',
          'prenomContact', 'prenom_util', 'prenomUtilisateur'
        ]);
        this.nomFamilleUtilisateur = this.pickProfileField(u, [
          'nomUtil', 'nom', 'nomClient', 'lastName', 'nomContact',
          'nomFamille', 'nomDeFamille', 'nom_util', 'nomUtilisateur', 'nomFamilleUtil'
        ]);
        this.applyNomCompletIfNeeded(u);
        if (!this.prenomUtilisateur) {
          this.prenomUtilisateur = this.pickProfileField(jwtPayload, [
            'given_name', 'prenom', 'firstName', 'prenomUtil'
          ]);
        }
        if (!this.nomFamilleUtilisateur) {
          this.nomFamilleUtilisateur = this.pickProfileField(jwtPayload, [
            'family_name', 'nom', 'lastName', 'nomUtil'
          ]);
        }
        const email = this.pickProfileField(u, ['emailUtil', 'email', 'mail']) || this.emailUtilisateur;
        this.emailUtilisateur = email || this.emailUtilisateur;
        this.telUtilisateur = raw.numTel ? String(raw.numTel) : '';
        if (!this.telUtilisateur) {
          this.telUtilisateur = this.pickProfileField(jwtPayload, ['phone_number', 'tel', 'telephone']);
        }
        const full = `${this.prenomUtilisateur} ${this.nomFamilleUtilisateur}`.trim();
        this.nomUtilisateur =
          full ||
          this.pickProfileField(u, ['nomComplet', 'raisonSociale', 'libelle', 'username', 'login']) ||
          this.pickProfileField(jwtPayload, ['name', 'preferred_username']) ||
          (this.emailUtilisateur ? this.emailUtilisateur.split('@')[0] : '') ||
          'Utilisateur';
        const lr = this.authService.getRole();
        if (lr) this.roleUtilisateur = lr;
        this.matricule      = raw.matricule   || '';
this.dateEmbauche   = raw.dateEmbauche || '';
this.nomDepartement = raw.departement?.nomDepartement || '';
this.profilEdit = {
  prenomUtil: this.prenomUtilisateur,
  nomUtil: this.nomFamilleUtilisateur,
  numTel: this.telUtilisateur
};
        this.cdr.markForCheck();
      },
      error: () => {
        if (!this.nomUtilisateur && this.emailUtilisateur) {
          this.nomUtilisateur = this.emailUtilisateur.split('@')[0];
        }
        if (!this.nomUtilisateur) this.nomUtilisateur = 'Utilisateur';
        this.cdr.markForCheck();
      }
    });
  }

  changerMotDePasse() {
  if (!this.mdp.ancien || !this.mdp.nouveau) { alert('Remplissez tous les champs !'); return; }
  if (this.mdp.nouveau.length < 8) { alert('Le mot de passe doit contenir au moins 8 caractères !'); return; }
  if (!/[A-Z]/.test(this.mdp.nouveau)) { alert('Le mot de passe doit contenir au moins une lettre majuscule !'); return; }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(this.mdp.nouveau)) { alert('Le mot de passe doit contenir au moins un caractère spécial !'); return; }
  if (this.mdp.nouveau !== this.mdp.confirmer) { alert('Les mots de passe ne correspondent pas !'); return; }

  const role = (this.authService.getRole() || '').toUpperCase();
  const url = role === 'CLIENT'
    ? `${this.baseUrl}/Api/clients/me/mot-de-passe`
    : `${this.baseUrl}/Api/employes/me/mot-de-passe`;

  this.http.put(url,
    { ancien: this.mdp.ancien, nouveau: this.mdp.nouveau },
    { headers: this.getHeaders(), responseType: 'text' }
  ).subscribe({
    next: () => {
      alert('Mot de passe modifié avec succès !');
      this.mdp = { ancien: '', nouveau: '', confirmer: '' };
    },
    error: (err) => {
      alert(err.status === 400 ? 'Ancien mot de passe incorrect !' : 'Erreur lors du changement.');
    }
  });
}

  changerLangue() {
    const noms: any = { fr: 'Français', ar: 'Arabe', en: 'Anglais' };
    alert(`Langue changée : ${noms[this.langueSelectionnee]}`);
  }

  // ===== MÉTIER / DÉPARTEMENT / FICHIER =====

  onMetierChange(): void {
    this.nouvelleDemande.departement = null;
    this.departementsFiltre = [];
    if (this.selectedIdMetier) {
      this.http.get<any[]>(`${this.baseUrl}/Api/departements/par-metier/${this.selectedIdMetier}`, { headers: this.getHeaders() })
        .subscribe({ next: (d) => this.departementsFiltre = d, error: () => {} });
    }
  }
  loadMetiers() {
  this.http.get<any[]>(`${this.baseUrl}/Api/metiers`, { headers: this.getHeaders() })
    .subscribe({
      next: (data) => this.metiers = data,
      error: () => {}
    });
}
  onFichierChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { alert('Fichier trop volumineux ! Maximum 10 MB.'); return; }
      this.pieceJointe = file;
    }
  }

  getFileIcon(): string {
    if (!this.pieceJointe) return '📁';
    const type = this.pieceJointe.type;
    if (type.startsWith('image/')) return '🖼️';
    if (type === 'application/pdf') return '📄';
    if (type.includes('word')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    return '📎';
  }

  // ===== DEMANDES =====

  selectTypeDemande(type: string) {
    this.demandeTypeSelectionne = type;
    this.demandeError = '';
    this.demandeSuccess = '';
    this.selectedIdMetier = null;
    this.departementsFiltre = [];
    this.pieceJointe = null;
    this.nouvelleDemande = {
      description: '',
      typeRequete: '',
      typeReclamation: '',
      niveauUrgence: '',
      typeProposition: '',
      departement: null
    };
  }

  soumettredemande() {
    this.demandeError = '';
    this.demandeSuccess = '';
    const d = this.nouvelleDemande;

    if (!d.description?.trim()) {
      this.demandeError = 'La description est obligatoire.'; return;
    }
    if (!d.departement) {
      this.demandeError = 'Veuillez choisir un département.'; return;
    }
    if (this.demandeTypeSelectionne === 'REQUETE' && !d.typeRequete) {
      this.demandeError = 'Veuillez choisir un type de requête.'; return;
    }
    if (this.demandeTypeSelectionne === 'RECLAMATION' && (!d.typeReclamation || !d.niveauUrgence)) {
      this.demandeError = 'Veuillez choisir le type de réclamation et le niveau d\'urgence.'; return;
    }
    if (this.demandeTypeSelectionne === 'PROPOSITION' && !d.typeProposition) {
      this.demandeError = 'Veuillez choisir un type de proposition.'; return;
    }

    this.demandeSubmitting = true;

    const onDone = () => {
      this.demandeSuccess = '✅ Votre demande a été enregistrée en brouillon.\n📝 Vous pouvez la modifier à tout moment depuis l\'Historique.\n⚠️ Elle ne sera pas traitée tant qu\'elle n\'est pas confirmée.';
      this.demandeSubmitting = false;
      this.selectedIdMetier = null;
      this.departementsFiltre = [];
      this.pieceJointe = null;
      this.nouvelleDemande = {
        description: '', typeRequete: '', typeReclamation: '',
        niveauUrgence: '', typeProposition: '', departement: null
      };
    };

    const onErr = () => {
      this.demandeError = 'Erreur lors de la soumission. Réessayez.';
      this.demandeSubmitting = false;
    };

    const payload: any = {
      description: d.description,
      departement: d.departement
    };

    if (this.demandeTypeSelectionne === 'REQUETE') {
      this.requeteService.save({ ...payload, typeRequete: d.typeRequete }, this.pieceJointe ?? undefined)
        .subscribe({ next: () => onDone(), error: onErr });
    } else if (this.demandeTypeSelectionne === 'RECLAMATION') {
      this.reclamationService.save({ ...payload, typeReclamation: d.typeReclamation, niveauUrgence: d.niveauUrgence }, this.pieceJointe ?? undefined)
        .subscribe({ next: () => onDone(), error: onErr });
    } else if (this.demandeTypeSelectionne === 'PROPOSITION') {
      this.propositionService.save({ ...payload, typeProposition: d.typeProposition }, this.pieceJointe ?? undefined)
        .subscribe({ next: () => onDone(), error: onErr });
    } else {
      this.demandeSubmitting = false;
    }
  }

  annulerDemandeForm() {
    this.demandeTypeSelectionne = '';
    this.demandeError = '';
    this.demandeSuccess = '';
    this.selectedIdMetier = null;
    this.departementsFiltre = [];
    this.pieceJointe = null;
    this.nouvelleDemande = {
      description: '', typeRequete: '', typeReclamation: '',
      niveauUrgence: '', typeProposition: '', departement: null
    };
  }

  // ===== LISTES DEMANDES (filtrées par département du responsable) =====

  chargerDepartementResponsable() {
    this.http.get<any>(`${this.baseUrl}/Api/employes/me/departement`, { headers: this.getHeaders() })
      .subscribe({
        next: (dept) => {
  if (dept) {
    this.idDepartementResponsable = dept.idDepartement;
    // Initialiser les statuts puis attendre 2s avant de démarrer le polling
    this.initialiserStatuts();
    setTimeout(() => {
      this.demarrerPolling();
    }, 2000);
  }
},
        error: () => {}
      });
  }

  ouvrirListePropositions() {
  this.activeSection = 'liste-propositions';
  this.rechercheDemande = '';
  this.filtreStatut = '';
  const url = this.idDepartementResponsable
    ? `${this.baseUrl}/Api/propositions/departement/${this.idDepartementResponsable}`
    : `${this.baseUrl}/Api/propositions`;
  this.http.get<any[]>(url, { headers: this.getHeaders() })
    .subscribe({ 
      next: (d) => this.propositions = d
        .filter(p => p.statut !== 'SUPPRIMEE' && p.statut !== 'SUPPRIME')
        .sort((a, b) => b.idDemande - a.idDemande), 
      error: () => {} 
    });
}

  ouvrirListeRequetes() {
  this.activeSection = 'liste-requetes';
  this.rechercheDemande = '';
  this.filtreStatut = '';
  const url = this.idDepartementResponsable
    ? `${this.baseUrl}/Api/requetes/departement/${this.idDepartementResponsable}`
    : `${this.baseUrl}/Api/requetes`;
  this.http.get<any[]>(url, { headers: this.getHeaders() })
    .subscribe({ 
      next: (d) => this.requetes = d
        .filter(r => r.statut !== 'SUPPRIMEE' && r.statut !== 'SUPPRIME')
        .sort((a, b) => b.idDemande - a.idDemande), 
      error: () => {} 
    });
}

  ouvrirListeReclamations() {
  this.activeSection = 'liste-reclamations';
  this.rechercheDemande = '';
  this.filtreStatut = '';
  const url = this.idDepartementResponsable
    ? `${this.baseUrl}/Api/reclamations/departement/${this.idDepartementResponsable}`
    : `${this.baseUrl}/Api/reclamations`;
  this.http.get<any[]>(url, { headers: this.getHeaders() })
    .subscribe({ 
      next: (d) => this.reclamations = d
        .filter(r => r.statut !== 'SUPPRIMEE' && r.statut !== 'SUPPRIME')
        .sort((a, b) => b.idDemande - a.idDemande), 
      error: () => {} 
    });
}

  // ===== HELPERS UTILISATEUR =====

  getNomUtilisateur(demande: any): string {
    const u = demande?.utilisateur;
    if (!u) return '—';
    return `${u.prenomUtil || ''} ${u.nomUtil || ''}`.trim() || u.emailUtil || '—';
  }

  getTypeUtilisateur(demande: any): string {
    const role = (demande?.utilisateur?.role || demande?.utilisateur?.nomRole || '').toUpperCase();
    if (role === 'CLIENT') return 'Client';
    if (role === 'EMPLOYE') return 'Employé';
    if (role === 'RESPONSABLE') return 'Responsable';
    if (role === 'ADMIN') return 'Admin';
    return role || '—';
  }

  demandesFiltrees(liste: any[]): any[] {
  let result = liste;
  if (this.filtreStatut) {
    result = result.filter(d => (d.statut || 'EN_ATTENTE') === this.filtreStatut);
  }
  if (this.rechercheDemande.trim()) {
    const s = this.rechercheDemande.trim().toLowerCase();
    result = result.filter(d =>
      String(d.idDemande || '').includes(s) ||
      (d.description || '').toLowerCase().includes(s)
    );
  }
  return result;
}

  // ===== MODAL TRAITEMENT =====

  ouvrirModalTraitement(demande: any, type: string) {
    this.demandeEnCours = { ...demande, _type: type };
    this.nouveauStatut = '';
    this.reponseTexte = '';
    this.reponseEnvoyee = false;
    this.reponseErreur = '';
  }

  envoyerReponse() {
  if (!this.nouveauStatut) { this.reponseErreur = 'Choisissez un statut.'; return; }
  if (!this.reponseTexte.trim()) { this.reponseErreur = 'La réponse est obligatoire.'; return; }

  const id = this.demandeEnCours.idDemande;
  const type = this.demandeEnCours._type;

  // IDs numériques comme dans la DB
  const statutMap: any = { 
    'EN_COURS': 3, 
    'TRAITEE':  4, 
    'CLOTUREE': 5, 
    'ANNULEE':  6 
  };
  const idEtat = statutMap[this.nouveauStatut];

  const urlStatut = type === 'REQUETE'
    ? `/Api/requetes/${id}/statut/${idEtat}`
    : type === 'RECLAMATION'
    ? `/Api/reclamations/${id}/statut/${idEtat}`
    : `/Api/propositions/${id}/statut/${idEtat}`;

this.http.put(`${this.baseUrl}${urlStatut}`, {}, { headers: this.getHeaders(), responseType: 'text' as 'json' })    .subscribe({
      next: () => {
        const reponse = {
          contenuReponse: this.reponseTexte,
          demande: { idDemande: id }
        };
        this.http.post(`${this.baseUrl}/Api/reponses`, reponse, { headers: this.getHeaders() })
          .subscribe({
            next: () => {
              this.reponseEnvoyee = true;
              this.demandeEnCours.statut = this.nouveauStatut;

              // Mettre à jour dans la liste locale
              if (type === 'REQUETE') {
                const idx = this.requetes.findIndex(r => r.idDemande === id);
                if (idx !== -1) this.requetes[idx].statut = this.nouveauStatut;
              } else if (type === 'RECLAMATION') {
                const idx = this.reclamations.findIndex(r => r.idDemande === id);
                if (idx !== -1) this.reclamations[idx].statut = this.nouveauStatut;
              } else {
                const idx = this.propositions.findIndex(p => p.idDemande === id);
                if (idx !== -1) this.propositions[idx].statut = this.nouveauStatut;
              }

              setTimeout(() => { this.demandeEnCours = null; }, 1500);
            },
            error: () => { this.reponseErreur = 'Erreur lors de l\'envoi de la réponse.'; }
          });
      },
      error: (err) => {
  console.error('Erreur statut:', err.status, err.error);
  this.reponseErreur = `Erreur ${err.status}: ${JSON.stringify(err.error)}`;
}
    });
}

  // ===== ÉDITION DEMANDES =====

  editerProposition(p: any) { this.propositionToEdit = { ...p }; }
  editerRequete(r: any) { this.requeteToEdit = { ...r }; }
  editerReclamation(r: any) { this.reclamationToEdit = { ...r }; }

  // ===== SUPPRESSION / SAVE DEMANDES =====

  supprimerProposition(id: number) {
    if (confirm('Supprimer cette proposition ?')) {
      this.http.delete(`${this.baseUrl}/Api/propositions/${id}`, { headers: this.getHeaders() })
        .subscribe({ next: () => this.ouvrirListePropositions(), error: () => {} });
    }
  }

  saveProposition() {
    this.http.put(`${this.baseUrl}/Api/propositions/${this.propositionToEdit.idDemande}`, this.propositionToEdit, { headers: this.getHeaders() })
      .subscribe({ next: () => { this.propositionToEdit = null; this.ouvrirListePropositions(); }, error: () => {} });
  }

  supprimerRequete(id: number) {
    if (confirm('Supprimer cette requête ?')) {
      this.http.delete(`${this.baseUrl}/Api/requetes/${id}`, { headers: this.getHeaders() })
        .subscribe({ next: () => this.ouvrirListeRequetes(), error: () => {} });
    }
  }

  saveRequete() {
    this.http.put(`${this.baseUrl}/Api/requetes/${this.requeteToEdit.idDemande}`, this.requeteToEdit, { headers: this.getHeaders() })
      .subscribe({ next: () => { this.requeteToEdit = null; this.ouvrirListeRequetes(); }, error: () => {} });
  }

  supprimerReclamation(id: number) {
    if (confirm('Supprimer cette réclamation ?')) {
      this.http.delete(`${this.baseUrl}/Api/reclamations/${id}`, { headers: this.getHeaders() })
        .subscribe({ next: () => this.ouvrirListeReclamations(), error: () => {} });
    }
  }

  saveReclamation() {
    this.http.put(`${this.baseUrl}/Api/reclamations/${this.reclamationToEdit.idDemande}`, this.reclamationToEdit, { headers: this.getHeaders() })
      .subscribe({ next: () => { this.reclamationToEdit = null; this.ouvrirListeReclamations(); }, error: () => {} });
  }

  // ===== ADMINISTRATION =====

  loadAll() {
    this.loadUtilisateurs(); this.loadDepartements();
    this.loadRoles(); this.loadPermissions(); this.loadRolesUtilisateurs();
  }

  loadUtilisateurs() {
    this.http.get<any[]>(`${this.baseUrl}/Api/utilisateurs`, { headers: this.getHeaders() })
      .subscribe({ next: (d) => this.utilisateurs = d, error: () => {} });
  }
  loadDepartements() {
    this.http.get<any[]>(`${this.baseUrl}/Api/departements`, { headers: this.getHeaders() })
      .subscribe({ next: (d) => this.departements = d, error: () => {} });
  }
  loadRoles() {
    this.http.get<any[]>(`${this.baseUrl}/Api/roles`, { headers: this.getHeaders() })
      .subscribe({ next: (d) => this.roles = d, error: () => {} });
  }
  loadPermissions() {
    this.http.get<any[]>(`${this.baseUrl}/Api/permissions`, { headers: this.getHeaders() })
      .subscribe({ next: (d) => this.permissions = d, error: () => {} });
  }
  loadRolesUtilisateurs() {
    this.http.get<any[]>(`${this.baseUrl}/Api/rolesUtilisateurs`, { headers: this.getHeaders() })
      .subscribe({ next: (d) => this.rolesUtilisateurs = d, error: () => {} });
  }

  getRoleUtilisateur(idUtil: number): string {
    const ru = this.rolesUtilisateurs.find(r => r.roleUtilisateurId?.idUtil === idUtil);
    return ru ? ru.role?.nomRole : 'AUCUN';
  }

  supprimerUtilisateur(id: number) {
    if (confirm('Supprimer cet utilisateur ?')) {
      this.http.delete(`${this.baseUrl}/Api/utilisateurs/${id}`, { headers: this.getHeaders() })
        .subscribe({ next: () => this.loadUtilisateurs(), error: () => {} });
    }
  }
  toggleEtatCompte(u: any) {
    const etat = u.etatCompte === 'ACTIF' ? 'INACTIF' : 'ACTIF';
    this.http.put(`${this.baseUrl}/Api/utilisateurs/${u.idUtil}`, { ...u, etatCompte: etat }, { headers: this.getHeaders() })
      .subscribe({ next: () => this.loadUtilisateurs(), error: () => {} });
  }
  affecterRole() {
    if (!this.affectation.idUtil || !this.affectation.idRole) { alert('Choisissez utilisateur et rôle !'); return; }
    this.http.post(`${this.baseUrl}/Api/rolesUtilisateurs`,
      { roleUtilisateurId: { idUtil: this.affectation.idUtil, idRole: this.affectation.idRole } },
      { headers: this.getHeaders() })
      .subscribe({ next: () => { alert('Rôle affecté !'); this.loadRolesUtilisateurs(); this.affectation = { idUtil: 0, idRole: 0 }; }, error: () => {} });
  }
  saveDepartement() {
    if (!this.nouveauDepartement.nomDepartement) { alert('Nom requis !'); return; }
    this.http.post(`${this.baseUrl}/Api/departements`, this.nouveauDepartement, { headers: this.getHeaders() })
      .subscribe({ next: () => { this.nouveauDepartement = { nomDepartement: '', descriptionDepartement: '' }; this.loadDepartements(); }, error: () => {} });
  }
  editerDepartement(d: any)  { this.departementEdite = { ...d }; }
  updateDepartement() {
    this.http.put(`${this.baseUrl}/Api/departements/${this.departementEdite.idDepartement}`, this.departementEdite, { headers: this.getHeaders() })
      .subscribe({ next: () => { this.departementEdite = null; this.loadDepartements(); }, error: () => {} });
  }
  supprimerDepartement(id: number) {
    if (confirm('Supprimer ?')) {
      this.http.delete(`${this.baseUrl}/Api/departements/${id}`, { headers: this.getHeaders() })
        .subscribe({ next: () => this.loadDepartements(), error: () => {} });
    }
  }
  savePermission() {
    if (!this.nouvellePermission.nomPermission) { alert('Nom requis !'); return; }
    this.http.post(`${this.baseUrl}/Api/permissions`, this.nouvellePermission, { headers: this.getHeaders() })
      .subscribe({ next: () => { this.nouvellePermission = { nomPermission: '', descriptionPermission: '' }; this.loadPermissions(); }, error: () => {} });
  }
  editerPermission(p: any)   { this.permissionEditee = { ...p }; }
  updatePermission() {
    this.http.put(`${this.baseUrl}/Api/permissions/${this.permissionEditee.idPermission}`, this.permissionEditee, { headers: this.getHeaders() })
      .subscribe({ next: () => { this.permissionEditee = null; this.loadPermissions(); }, error: () => {} });
  }
  supprimerPermission(id: number) {
    if (confirm('Supprimer ?')) {
      this.http.delete(`${this.baseUrl}/Api/permissions/${id}`, { headers: this.getHeaders() })
        .subscribe({ next: () => this.loadPermissions(), error: () => {} });
    }
  }
  saveRole() {
    if (!this.nouveauRole.nomRole) { alert('Nom requis !'); return; }
    this.http.post(`${this.baseUrl}/Api/roles`, this.nouveauRole, { headers: this.getHeaders() })
      .subscribe({ next: () => { this.nouveauRole = { nomRole: '', descriptionRole: '' }; this.loadRoles(); }, error: () => {} });
  }
  editerRole(r: any) { this.roleEdite = { ...r }; }
  updateRole() {
    this.http.put(`${this.baseUrl}/Api/roles/${this.roleEdite.idRole}`, this.roleEdite, { headers: this.getHeaders() })
      .subscribe({ next: () => { this.roleEdite = null; this.loadRoles(); }, error: () => {} });
  }
  supprimerRole(id: number) {
    if (confirm('Supprimer ?')) {
      this.http.delete(`${this.baseUrl}/Api/roles/${id}`, { headers: this.getHeaders() })
        .subscribe({ next: () => this.loadRoles(), error: () => {} });
    }
  }
  sauvegarderProfil() {
  this.http.put(`${this.baseUrl}/Api/employes/me`, this.profilEdit, { headers: this.getHeaders() })
    .subscribe({
      next: () => {
        this.prenomUtilisateur     = this.profilEdit.prenomUtil;
        this.nomFamilleUtilisateur = this.profilEdit.nomUtil;
        this.telUtilisateur        = this.profilEdit.numTel;
        this.nomUtilisateur        = `${this.profilEdit.prenomUtil} ${this.profilEdit.nomUtil}`.trim();
        this.editProfil = false;
        alert('Profil mis à jour !');
      },
      error: () => alert('Erreur lors de la mise à jour.')
    });
}
  telechargerFichier(nomFichier: string) {
  const token = localStorage.getItem('token');
  this.http.get(`${this.baseUrl}/Api/fichiers/download/${nomFichier}`, { 
    headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
    responseType: 'blob'
  }).subscribe({
    next: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.download = nomFichier;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    error: () => alert('Impossible de charger le fichier.')
  });
}
deconnecter() {
  try { this.socialAuthService.signOut(); } catch(e) {}
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('permissions');
  window.location.href = '/login';
}
ngOnDestroy() {
  if (this.pollingInterval) clearInterval(this.pollingInterval);
}

chargerNotifications() {
  this.notifService.getAll().subscribe({
    next: (notifs) => {
      this.notifications = notifs;
      this.cdr.markForCheck();
    },
    error: () => {}
  });
}

// ─── polling : seuls les changements de statut sont détectés côté Angular ───
// Les nouvelles demandes sont notifiées côté backend (Spring Boot)

verifierChangementsStatut() {
  if (!this.notifApp) return;
  const urls = [
    `${this.baseUrl}/Api/requetes/mes-demandes`,
    `${this.baseUrl}/Api/reclamations/mes-demandes`,
    `${this.baseUrl}/Api/propositions/mes-demandes`
  ];
  urls.forEach(url => {
    this.http.get<any[]>(url, { headers: this.getHeaders() }).subscribe({
      next: (demandes) => {
        demandes.forEach(d => {
          const key = String(d.idDemande);
          const statutActuel = d.statut;
          if (this.dernierStatuts[key] && this.dernierStatuts[key] !== statutActuel) {
            // Créer la notif côté backend
            this.http.post('http://localhost:8082/Api/notifications', {
              emailDestinataire: this.emailUtilisateur,
              message: `Votre demande #${key} est passée au statut : ${statutActuel}`,
              type: 'STATUT_CHANGE'
            }, { headers: this.getHeaders() }).subscribe({
              next: () => this.chargerNotifications(),
              error: () => {}
            });
          }
          this.dernierStatuts[key] = statutActuel;
        });
      },
      error: () => {}
    });
  });
}

verifierNouvellesDemandes() {
  // Les nouvelles demandes sont notifiées par le backend (PropositionController etc.)
  // On recharge juste les notifs pour les afficher
  this.chargerNotifications();
}

marquerNotifLue(id: number) {
  this.notifService.marquerLu(id).subscribe({
    next: () => this.chargerNotifications(),
    error: () => {}
  });
}

supprimerNotif(id: number) {
  this.notifService.supprimer(id).subscribe({
    next: () => this.chargerNotifications(),
    error: () => {}
  });
}

trackNotif(index: number, n: any): number {
  return n.idNotification;
}

get notifCount(): number {
  return this.notifications.filter(n => !n.lu).length;
}
initialiserStatuts() {
  const urls = [
    `${this.baseUrl}/Api/requetes/mes-demandes`,
    `${this.baseUrl}/Api/reclamations/mes-demandes`,
    `${this.baseUrl}/Api/propositions/mes-demandes`
  ];
  urls.forEach(url => {
    this.http.get<any[]>(url, { headers: this.getHeaders() }).subscribe({
      next: (demandes) => {
        demandes.forEach(d => {
          this.dernierStatuts[String(d.idDemande)] = d.statut;
        });
      },
      error: () => {}
    });
  });
}

demarrerPolling() {
  
}
toggleNotifApp() {
  this.http.put(
    `${this.baseUrl}/Api/utilisateurs/me/preferences`,
    { notifApp: this.notifApp },
    { headers: this.getHeaders() }
  ).subscribe({ next: () => {}, error: () => {} });
  this.cdr.detectChanges();
}
}