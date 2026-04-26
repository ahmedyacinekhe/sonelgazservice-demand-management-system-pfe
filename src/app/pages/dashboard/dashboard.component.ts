import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RequeteService } from '../../core/services/requete.service';
import { ReclamationService } from '../../core/services/reclamation.service';
import { PropositionService } from '../../core/services/proposition.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  activeSection = 'home';
  sidebarOpen = true;
  profileMenuOpen = false;
  currentYear = new Date().getFullYear();

  // Infos utilisateur (pas de libellé « Administrateur » par défaut : évite confusion pour un CLIENT, etc.)
  nomUtilisateur        = '';
  prenomUtilisateur     = '';
  nomFamilleUtilisateur = '';
  emailUtilisateur      = '';
  telUtilisateur        = '';
  roleUtilisateur       = '';

  // Paramètres
  mdp = { ancien: '', nouveau: '', confirmer: '' };
  langueSelectionnee = 'fr';
  notifEmail = true;
  notifApp   = true;

  // Demande (mêmes champs que les pages propositions / requêtes / réclamations)
  demandeTypeSelectionne = '';
  demandeSubmitting = false;
  demandeError = '';
  demandeSuccess = '';
  nouvelleDemande = {
    description: '',
    typeRequete: '',
    typeReclamation: '',
    niveauUrgence: '',
    typeProposition: ''
  };

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

  /**
   * Profil connecté : rôle ADMIN (écran dédié /dashboard-admin en usage normal)
   * vs profils employé / responsable / client sur ce tableau.
   */
  isAdmin = false;
  /** Toujours vrai pour les non-admins : Accueil, Ajouter demande, Historique dans la sidebar. */
  showEmployeMenus = false;
  /** Ex. responsable avec permission TRAITER_DEMANDE (ou TRAITER_DEMANDES) — gestion des dossiers. */
  canTraiterDemandes = false;
  canGererUtilisateurs = false;
  canGererRoles = false;
  canGererPermissions = false;
  canGererDepartements = false;
  showAdministrationBlock = false;

  private baseUrl = 'http://localhost:8082';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private requeteService: RequeteService,
    private reclamationService: ReclamationService,
    private propositionService: PropositionService
  ) {}

  ngOnInit() {
    this.refreshAccessFlags();
    this.normalizeActiveSection();
    if (this.showAdministrationBlock) {
      this.loadAll();
    }
    this.loadCurrentUser();
  }

  /** Si la section courante n'est pas autorisée pour ce profil, revenir à l'accueil. */
  normalizeActiveSection(): void {
    const s = this.activeSection;
    if (!this.showEmployeMenus && (s === 'demandes' || s === 'historique')) {
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

  /** Met à jour les drapeaux à partir du rôle et des permissions stockés après login. */
  refreshAccessFlags(): void {
    this.isAdmin = this.authService.isAdminRole();
    this.showEmployeMenus = !this.isAdmin;
    // Gestion opérationnelle des demandes : uniquement si la permission est dans le JWT (ex. responsable).
    this.canTraiterDemandes =
      this.showEmployeMenus &&
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

  /** Première valeur textuelle non vide parmi plusieurs clés possibles (API client / employé / Spring). */
  private pickProfileField(obj: any, keys: string[]): string {
    if (!obj) {
      return '';
    }
    for (const k of keys) {
      const v = obj[k];
      if (v === undefined || v === null) {
        continue;
      }
      const s = String(v).trim();
      if (s !== '' && s !== '0') {
        return s;
      }
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

  /**
   * Aplatit la réponse API (racine + tous sous-objets JSON « simples »), ex. client → utilisateur → prénom.
   */
  private flattenProfilePayload(u: any, depth = 0): Record<string, unknown> {
    if (depth > 12 || !this.isPlainRecord(u)) {
      return {};
    }
    let acc: Record<string, unknown> = { ...u };
    for (const v of Object.values(u)) {
      if (this.isPlainRecord(v)) {
        acc = { ...acc, ...this.flattenProfilePayload(v, depth + 1) };
      }
    }
    return acc;
  }

  /** Ouvre « Mon profil » et relance le chargement (utile après login ou si la première requête a échoué). */
  openProfilSection() {
    this.activeSection = 'profil';
    this.profileMenuOpen = false;
    this.closeSidebarMobile();
    this.loadCurrentUser();
  }

  /** Remplit prénom / nom à partir d’un champ « nom complet » si présent. */
  private applyNomCompletIfNeeded(u: Record<string, unknown>): void {
    if (this.prenomUtilisateur || this.nomFamilleUtilisateur) {
      return;
    }
    const nc = this.pickProfileField(u, [
      'nomComplet', 'nomPrenom', 'fullName', 'displayName', 'libelle'
    ]);
    if (!nc) {
      return;
    }
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
          this.authService.getRole() ||
          '';
      } catch { /* ignore */ }
    }
    const role = (this.authService.getRole() || this.roleUtilisateur || '').toUpperCase();
    const url =
      role === 'CLIENT'
        ? `${this.baseUrl}/Api/clients/me`
        : `${this.baseUrl}/Api/employes/me`;

    this.http.get<any>(url, { headers: this.getHeaders() }).subscribe({
      next: (raw) => {
        const u = this.flattenProfilePayload(raw);
        this.prenomUtilisateur = this.pickProfileField(u, [
          'prenomUtil',
          'prenom',
          'prenomClient',
          'firstName',
          'prenomContact',
          'prenom_util',
          'prenomUtilisateur'
        ]);
        this.nomFamilleUtilisateur = this.pickProfileField(u, [
          'nomUtil',
          'nom',
          'nomClient',
          'lastName',
          'nomContact',
          'nomFamille',
          'nomDeFamille',
          'nom_util',
          'nomUtilisateur',
          'nomFamilleUtil'
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
        this.telUtilisateur = this.pickProfileField(u, [
          'numTel',
          'telephone',
          'tel',
          'phone',
          'numeroTelephone',
          'mobile',
          'numTelephone',
          'portable',
          'gsm',
          'telephoneMobile',
          'telephonePortable',
          'phoneNumber'
        ]);
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
        if (lr) {
          this.roleUtilisateur = lr;
        }
        this.cdr.markForCheck();
      },
      error: () => {
        if (!this.nomUtilisateur && this.emailUtilisateur) {
          this.nomUtilisateur = this.emailUtilisateur.split('@')[0];
        }
        if (!this.nomUtilisateur) {
          this.nomUtilisateur = 'Utilisateur';
        }
        this.cdr.markForCheck();
      }
    });
  }

  changerMotDePasse() {
    if (!this.mdp.ancien || !this.mdp.nouveau) { alert('Remplissez tous les champs !'); return; }
    if (this.mdp.nouveau !== this.mdp.confirmer) { alert('Les mots de passe ne correspondent pas !'); return; }
    alert('Mot de passe modifié avec succès !');
    this.mdp = { ancien: '', nouveau: '', confirmer: '' };
  }

  changerLangue() {
    const noms: any = { fr: 'Français', ar: 'Arabe', en: 'Anglais' };
    alert(`Langue changée : ${noms[this.langueSelectionnee]}`);
  }

  selectTypeDemande(type: string) {
    this.demandeTypeSelectionne = type;
    this.demandeError = '';
    this.demandeSuccess = '';
    this.nouvelleDemande = {
      description: '',
      typeRequete: '',
      typeReclamation: '',
      niveauUrgence: '',
      typeProposition: ''
    };
  }

  soumettredemande() {
    this.demandeError = '';
    this.demandeSuccess = '';
    const d = this.nouvelleDemande;

    if (!d.description?.trim()) {
      this.demandeError = 'La description est obligatoire.';
      return;
    }

    if (this.demandeTypeSelectionne === 'REQUETE' && !d.typeRequete) {
      this.demandeError = 'Veuillez choisir un type de requête.';
      return;
    }
    if (this.demandeTypeSelectionne === 'RECLAMATION' && (!d.typeReclamation || !d.niveauUrgence)) {
      this.demandeError = 'Veuillez choisir le type de réclamation et le niveau d\'urgence.';
      return;
    }
    if (this.demandeTypeSelectionne === 'PROPOSITION' && !d.typeProposition) {
      this.demandeError = 'Veuillez choisir un type de proposition.';
      return;
    }

    this.demandeSubmitting = true;

    const onDone = (msg: string) => {
      this.demandeSuccess = msg;
      this.demandeSubmitting = false;
      this.nouvelleDemande = {
        description: '',
        typeRequete: '',
        typeReclamation: '',
        niveauUrgence: '',
        typeProposition: ''
      };
      this.demandeTypeSelectionne = '';
    };

    const onErr = () => {
      this.demandeError = 'Erreur lors de la soumission. Réessayez.';
      this.demandeSubmitting = false;
    };

    if (this.demandeTypeSelectionne === 'REQUETE') {
      this.requeteService.save({ description: d.description, typeRequete: d.typeRequete }).subscribe({
        next: () => onDone('Requête soumise avec succès !'),
        error: onErr
      });
    } else if (this.demandeTypeSelectionne === 'RECLAMATION') {
      this.reclamationService
        .save({
          description: d.description,
          typeReclamation: d.typeReclamation,
          niveauUrgence: d.niveauUrgence
        })
        .subscribe({
          next: () => onDone('Réclamation soumise avec succès !'),
          error: onErr
        });
    } else if (this.demandeTypeSelectionne === 'PROPOSITION') {
      this.propositionService.save({ description: d.description, typeProposition: d.typeProposition }).subscribe({
        next: () => onDone('Proposition soumise avec succès !'),
        error: onErr
      });
    } else {
      this.demandeSubmitting = false;
    }
  }

  annulerDemandeForm() {
    this.demandeTypeSelectionne = '';
    this.demandeError = '';
    this.demandeSuccess = '';
    this.nouvelleDemande = {
      description: '',
      typeRequete: '',
      typeReclamation: '',
      niveauUrgence: '',
      typeProposition: ''
    };
  }

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
}