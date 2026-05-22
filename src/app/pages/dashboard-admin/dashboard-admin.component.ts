import { ChangeDetectorRef, Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { RequeteService } from '../../core/services/requete.service';
import { ReclamationService } from '../../core/services/reclamation.service';
import { PropositionService } from '../../core/services/proposition.service';
import { HistoriqueComponent } from '../historique/historique.component';
import { NotificationService, AppNotification } from '../../core/services/notification.service';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HistoriqueComponent,
  ],
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardAdminComponent implements OnInit, OnDestroy {

  activeSection = 'home';
  sidebarOpen = true;
  profileMenuOpen = false;
  currentYear = new Date().getFullYear();

  nomUtilisateur        = 'Administrateur';
  prenomUtilisateur     = '';
  nomFamilleUtilisateur = '';
  emailUtilisateur      = 'admin@sonelgaz.dz';
  telUtilisateur        = '';
  roleUtilisateur       = 'Admin';
  matricule             = '';
  dateEmbauche          = '';
  nomDepartement        = '';
  notifications: AppNotification[] = [];
  notifOpen = false;
  private pollingInterval: any;
  private dernierStatuts: Record<string, string> = {};
  private idMaxDemande = 0;
  showModalPermissions  = false;
  rolePermissionsAffiche: any = null;
  permissionsRoleAffiche: any[] = [];

  pieceJointe: File | null = null;

  onFichierChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Fichier trop volumineux ! Maximum 10 MB.');
        return;
      }
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

  showModalMetiers = false;
  departementPourMetiers: any = null;
  metiersSelectionnesDepartement: number[] = [];
  metiersSaving = false;
  metiersSaveError = '';
  metiersSaveSuccess = '';

  voirPermissionsRole(role: any) {
    if (this.rolePermissionsAffiche?.idRole === role.idRole) {
      this.rolePermissionsAffiche = null;
      this.permissionsRoleAffiche = [];
      return;
    }
    this.rolePermissionsAffiche = role;
    this.http.get<any[]>(`${this.baseUrl}/Api/rolePermissions/role/${role.idRole}`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => this.permissionsRoleAffiche = data,
        error: () => this.permissionsRoleAffiche = []
      });
  }

  ouvrirModalPermissions() {
    if (!this.nouveauRole.nomRole) {
      alert('Veuillez saisir un nom de rôle !');
      return;
    }
    this.nouvellePermissionRole = [];
    this.showModalPermissions = true;
  }

  editProfil = false;
  profilEdit = { prenomUtil: '', nomUtil: '', numTel: '' };

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

  metiers: any[] = [];
  departementsFiltre: any[] = [];
  selectedIdMetier: number | null = null;

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

  utilisateurs: any[] = [];
  departements: any[] = [];
  roles: any[] = [];
  permissions: any[] = [];
  rolesUtilisateurs: any[] = [];

  rechercheRole = '';
  rolesFiltres(): any[] {
    const search = this.rechercheRole.toLowerCase().trim();
    if (!search) return this.roles;
    return this.roles.filter(r => (r.nomRole || '').toLowerCase().includes(search));
  }

  recherchePermission = '';
  permissionsFiltres(): any[] {
    const search = this.recherchePermission.toLowerCase().trim();
    if (!search) return this.permissions;
    return this.permissions.filter(p => (p.nomPermission || '').toLowerCase().includes(search));
  }

  rechercheUtilisateur = '';
  utilisateursFiltres(): any[] {
    const search = this.rechercheUtilisateur.toLowerCase().trim();
    if (!search) return this.utilisateurs;
    return this.utilisateurs.filter(u =>
      (u.nomUtil || '').toLowerCase().includes(search) ||
      (u.prenomUtil || '').toLowerCase().includes(search)
    );
  }

  rechercheDepartement = '';
  departementsFiltres(): any[] {
    const search = this.rechercheDepartement.toLowerCase().trim();
    if (!search) return this.departements;
    return this.departements.filter(d => (d.nomDepartement || '').toLowerCase().includes(search));
  }

  rechercheAffectation = '';
  showAffectationDropdown = false;

  utilisateursFiltresAffectation(): any[] {
    const s = this.rechercheAffectation.toLowerCase().trim();
    if (!s) return this.utilisateurs;
    return this.utilisateurs.filter(u =>
      (u.nomUtil || '').toLowerCase().includes(s) ||
      (u.prenomUtil || '').toLowerCase().includes(s)
    );
  }

  selectUtilisateurAffectation(u: any) {
    this.affectation.idUtil = u.idUtil;
    this.rechercheAffectation = `${u.prenomUtil} ${u.nomUtil}`;
    this.showAffectationDropdown = false;
  }

  onRoleAffectationChange() {
    this.affectation.idDepartement = 0;
  }

  affectationNecessiteDepartement(): boolean {
    const role = this.roles.find(r => Number(r.idRole) === Number(this.affectation.idRole));
    if (!role) return false;
    const nom = role.nomRole.toUpperCase();
    return nom === 'EMPLOYE' || nom === 'RESPONSABLE' || nom === 'ADMIN';
  }

  nouveauDepartement = { nomDepartement: '', nombreEmployes: 0 };
  departementEdite: any = null;
  departementSelectionne: any = null;
  employesDepartement: any[] = [];

  voirEmployesDepartement(d: any) {
    this.departementSelectionne = d;
    this.http.get<any[]>(`${this.baseUrl}/Api/employes/departement/${d.idDepartement}`,
      { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.employesDepartement = data.filter(e => {
            const role = this.getRoleUtilisateur(e.idUtil);
            return role !== 'CLIENT';
          });
        },
        error: () => this.employesDepartement = []
      });
  }

  fermerEmployesDepartement() {
    this.departementSelectionne = null;
    this.employesDepartement = [];
  }

  nouvellePermission  = { nomPermission: '', descriptionPermission: '' };
  permissionEditee: any = null;
  nouveauRole         = { nomRole: '', descriptionRole: '' };
  roleEdite: any      = null;
  affectation         = { idUtil: 0, idRole: 0, idDepartement: 0 };

  permissionsRole: { [idRole: number]: number[] } = {};
  nouvellePermissionRole: number[] = [];

  private baseUrl = 'http://localhost:8082';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private requeteService: RequeteService,
    private reclamationService: ReclamationService,
    private propositionService: PropositionService,
    private notifService: NotificationService
  ) {}

  ngOnInit() {
    this.loadAll();
    this.loadMetiers(); // ← AJOUTÉ
    this.loadCurrentUser();
    this.http.get<any>(`${this.baseUrl}/Api/utilisateurs/me/preferences`, { headers: this.getHeaders() })
      .subscribe({
        next: (prefs) => {
          this.notifApp = prefs.notifApp !== false;
          localStorage.setItem(this.currentUserKey, String(this.notifApp));
          this.cdr.detectChanges();
        },
        error: () => {
          this.notifApp = localStorage.getItem(this.currentUserKey) !== 'false';
        }
      });
    this.chargerNotifications();
    this.demarrerPolling();
  }

  onMetierChange(): void {
    this.nouvelleDemande.departement = null;
    this.departementsFiltre = [];
    if (this.selectedIdMetier) {
      const url = `${this.baseUrl}/Api/departements/par-metier/${this.selectedIdMetier}`;
      this.http.get<any[]>(url, { headers: this.getHeaders() })
        .subscribe({
          next: (data) => this.departementsFiltre = data,
          error: () => this.departementsFiltre = []
        });
    }
  }

  gererMetiersDepartement(d: any) {
    this.departementPourMetiers = d;
    this.metiersSelectionnesDepartement = [];
    this.metiersSaveError = '';
    this.metiersSaveSuccess = '';
    this.http.get<number[]>(
      `${this.baseUrl}/Api/departements/${d.idDepartement}/metiers`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (ids) => {
        this.metiersSelectionnesDepartement = ids;
        this.showModalMetiers = true;
      },
      error: () => {
        this.showModalMetiers = true;
      }
    });
  }

  isMetierSelected(idMetier: number): boolean {
    return this.metiersSelectionnesDepartement.includes(idMetier);
  }

  toggleMetierDepartement(idMetier: number) {
    const index = this.metiersSelectionnesDepartement.indexOf(idMetier);
    if (index === -1) this.metiersSelectionnesDepartement.push(idMetier);
    else this.metiersSelectionnesDepartement.splice(index, 1);
  }

  sauvegarderMetiersDepartement() {
    this.metiersSaveError = '';
    this.metiersSaveSuccess = '';
    this.metiersSaving = true;
    this.http.post(
      `${this.baseUrl}/Api/departements/${this.departementPourMetiers.idDepartement}/metiers`,
      this.metiersSelectionnesDepartement,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.metiersSaving = false;
        this.metiersSaveSuccess = 'Métiers enregistrés avec succès !';
        setTimeout(() => this.showModalMetiers = false, 1000);
      },
      error: () => {
        this.metiersSaving = false;
        this.metiersSaveError = 'Erreur lors de la sauvegarde. Réessayez.';
      }
    });
  }

  onAvatarError(event: any) { event.target.style.display = 'none'; }
  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }
  closeSidebarMobile() { if (window.innerWidth < 900) this.sidebarOpen = false; }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  loadCurrentUser() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.emailUtilisateur = payload.sub || payload.email || 'admin@sonelgaz.dz';
        this.roleUtilisateur  = payload.role || payload.roles?.[0] || 'Admin';
      } catch { }
    }
    this.http.get<any>(`${this.baseUrl}/Api/employes/me`, { headers: this.getHeaders() })
      .subscribe({
        next: (u) => {
          this.prenomUtilisateur     = u.prenomUtil  || '';
          this.nomFamilleUtilisateur = u.nomUtil     || '';
          this.nomUtilisateur        = `${u.prenomUtil || ''} ${u.nomUtil || ''}`.trim() || 'Administrateur';
          this.emailUtilisateur      = u.emailUtil   || this.emailUtilisateur;
          this.telUtilisateur        = String(u.numTel || '');
          this.matricule             = u.matricule   || '';
          this.dateEmbauche          = u.dateEmbauche || '';
          this.nomDepartement        = u.departement?.nomDepartement || '';
          this.profilEdit = {
            prenomUtil: this.prenomUtilisateur,
            nomUtil: this.nomFamilleUtilisateur,
            numTel: this.telUtilisateur
          };
          const lr = this.authService.getRole();
          if (lr) this.roleUtilisateur = lr;
        },
        error: () => {}
      });
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

  changerMotDePasse() {
    if (!this.mdp.ancien || !this.mdp.nouveau) { alert('Remplissez tous les champs !'); return; }
    if (this.mdp.nouveau.length < 8) { alert('Le mot de passe doit contenir au moins 8 caractères !'); return; }
    if (!/[A-Z]/.test(this.mdp.nouveau)) { alert('Le mot de passe doit contenir au moins une lettre majuscule !'); return; }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(this.mdp.nouveau)) { alert('Le mot de passe doit contenir au moins un caractère spécial !'); return; }
    if (this.mdp.nouveau !== this.mdp.confirmer) { alert('Les mots de passe ne correspondent pas !'); return; }
    this.http.put(`${this.baseUrl}/Api/employes/me/mot-de-passe`,
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
    const noms: Record<string, string> = { fr: 'Français', ar: 'Arabe', en: 'Anglais' };
    alert(`Langue changée : ${noms[this.langueSelectionnee]}`);
  }

  selectTypeDemande(type: string) {
    this.demandeTypeSelectionne = type;
    this.demandeError = '';
    this.demandeSuccess = '';
    this.selectedIdMetier = null;
    this.departementsFiltre = [];
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

    if (!d.description?.trim()) { this.demandeError = 'La description est obligatoire.'; return; }
    if (!d.departement) { this.demandeError = 'Veuillez choisir un métier et un département.'; return; }
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
      this.demandeSubmitting = false;
      this.pieceJointe = null;
      this.selectedIdMetier = null;
      this.departementsFiltre = [];
      this.nouvelleDemande = {
        description: '', typeRequete: '', typeReclamation: '',
        niveauUrgence: '', typeProposition: '', departement: null
      };
      this.demandeSuccess = '✅ Votre demande a été enregistrée en brouillon.\n📝 Vous pouvez la modifier à tout moment depuis l\'Historique.\n⚠️ Elle ne sera pas traitée tant qu\'elle n\'est pas confirmée.';
    };

    const onErr = () => {
      this.demandeError = 'Erreur lors de la soumission. Réessayez.';
      this.demandeSubmitting = false;
    };

    if (this.demandeTypeSelectionne === 'REQUETE') {
      this.requeteService.save({
        description: d.description, typeRequete: d.typeRequete, departement: d.departement
      }, this.pieceJointe ?? undefined).subscribe({ next: onDone, error: onErr });
    } else if (this.demandeTypeSelectionne === 'RECLAMATION') {
      this.reclamationService.save({
        description: d.description, typeReclamation: d.typeReclamation,
        niveauUrgence: d.niveauUrgence, departement: d.departement
      }, this.pieceJointe ?? undefined).subscribe({ next: onDone, error: onErr });
    } else if (this.demandeTypeSelectionne === 'PROPOSITION') {
      this.propositionService.save({
        description: d.description, typeProposition: d.typeProposition, departement: d.departement
      }, this.pieceJointe ?? undefined).subscribe({ next: onDone, error: onErr });
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
    this.nouvelleDemande = {
      description: '', typeRequete: '', typeReclamation: '',
      niveauUrgence: '', typeProposition: '', departement: null
    };
  }

  loadAll() {
    this.loadUtilisateurs();
    this.loadDepartements();
    this.loadRoles();
    this.loadPermissions();
    this.loadRolesUtilisateurs();
    this.loadMetiers(); // ← AJOUTÉ
  }

  loadUtilisateurs() {
    this.http.get<any[]>(`${this.baseUrl}/Api/utilisateurs`, { headers: this.getHeaders() })
      .subscribe({ next: (d) => this.utilisateurs = d, error: () => {} });
  }

  loadDepartements() {
    this.http.get<any[]>(`${this.baseUrl}/Api/departements`, { headers: this.getHeaders() })
      .subscribe({
        next: (d) => this.departements = d.sort((a, b) => a.idDepartement - b.idDepartement),
        error: () => {}
      });
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

  // ← AJOUTÉ
  loadMetiers() {
    this.http.get<any[]>(`${this.baseUrl}/Api/metiers`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => this.metiers = data,
        error: () => {}
      });
  }

  getRoleUtilisateur(idUtil: number): string {
    const ru = this.rolesUtilisateurs.find(r => r.roleUtilisateurId?.idUtil === idUtil);
    return ru ? ru.role?.nomRole : 'AUCUN';
  }

  isPermissionSelected(idPermission: number): boolean {
    return this.nouvellePermissionRole.includes(idPermission);
  }

  togglePermission(idPermission: number) {
    const index = this.nouvellePermissionRole.indexOf(idPermission);
    if (index === -1) this.nouvellePermissionRole.push(idPermission);
    else this.nouvellePermissionRole.splice(index, 1);
  }

  saveRoleAvecPermissions() {
    if (!this.nouveauRole.nomRole) { alert('Nom requis !'); return; }
    this.http.post<any>(`${this.baseUrl}/Api/roles`, this.nouveauRole, { headers: this.getHeaders() })
      .subscribe({
        next: (role) => {
          const idRole = role.idRole;
          if (!idRole) {
            this.http.get<any[]>(`${this.baseUrl}/Api/roles`, { headers: this.getHeaders() })
              .subscribe({
                next: (roles) => {
                  const idRoleReel = roles[roles.length - 1].idRole;
                  const requests = this.nouvellePermissionRole.map(idPerm =>
                    this.http.post(`${this.baseUrl}/Api/rolePermissions`,
                      { rolePermissionId: { idRole: idRoleReel, idPermission: idPerm } },
                      { headers: this.getHeaders() }).toPromise()
                  );
                  Promise.all(requests).then(() => {
                    this.nouveauRole = { nomRole: '', descriptionRole: '' };
                    this.nouvellePermissionRole = [];
                    this.showModalPermissions = false;
                    this.loadAll();
                    setTimeout(() => alert('Rôle créé avec succès !'), 500);
                  }).catch(() => {
                    this.nouveauRole = { nomRole: '', descriptionRole: '' };
                    this.nouvellePermissionRole = [];
                    this.showModalPermissions = false;
                    this.loadAll();
                  });
                }
              });
          } else {
            const requests = this.nouvellePermissionRole.map(idPerm =>
              this.http.post(`${this.baseUrl}/Api/rolePermissions`,
                { rolePermissionId: { idRole, idPermission: idPerm } },
                { headers: this.getHeaders() }).toPromise()
            );
            Promise.all(requests).then(() => {
              this.nouveauRole = { nomRole: '', descriptionRole: '' };
              this.nouvellePermissionRole = [];
              this.showModalPermissions = false;
              this.loadAll();
              setTimeout(() => alert('Rôle créé avec succès !'), 500);
            }).catch(() => {
              this.nouveauRole = { nomRole: '', descriptionRole: '' };
              this.nouvellePermissionRole = [];
              this.showModalPermissions = false;
              this.loadAll();
            });
          }
        },
        error: (err) => alert('Erreur lors de la création du rôle : ' + (err.error?.message || err.status))
      });
  }

  supprimerUtilisateur(id: number) {
    if (confirm('Supprimer cet utilisateur ?')) {
      this.http.delete(`${this.baseUrl}/Api/utilisateurs/${id}`, { headers: this.getHeaders() })
        .subscribe({ next: () => this.loadUtilisateurs(), error: () => {} });
    }
  }

  toggleEtatCompte(u: any) {
    const etat = u.etatCompte === 'ACTIF' ? 'INACTIF' : 'ACTIF';
    this.http.put(`${this.baseUrl}/Api/utilisateurs/${u.idUtil}/etat?etat=${etat}`, {},
      { headers: this.getHeaders() })
      .subscribe({ next: () => this.loadUtilisateurs(), error: (err) => alert('Erreur: ' + err.status) });
  }

  affecterRole() {
    if (!this.affectation.idUtil || !this.affectation.idRole) {
      alert('Choisissez utilisateur et rôle !'); return;
    }
    const roleSelectionne = this.roles.find(r => Number(r.idRole) === Number(this.affectation.idRole));
    const nomRole = roleSelectionne ? roleSelectionne.nomRole : '';
    const necessiteDepartement = nomRole.toUpperCase() === 'EMPLOYE' ||
                                 nomRole.toUpperCase() === 'RESPONSABLE';
    if (necessiteDepartement && !this.affectation.idDepartement) {
      alert('Veuillez choisir un département pour ce rôle !'); return;
    }
    const { idUtil, idRole, idDepartement } = this.affectation;
    this.http.post(
      `${this.baseUrl}/Api/utilisateurs/${idUtil}/affecter-role?idRole=${idRole}&idDepartement=${idDepartement}`,
      {},
      { headers: this.getHeaders(), responseType: 'text' as 'json' }
    ).subscribe({
      next: () => {
        this.loadAll();
        if (this.departementSelectionne) {
          setTimeout(() => this.voirEmployesDepartement(this.departementSelectionne), 500);
        }
        alert('Rôle affecté avec succès !');
        this.affectation = { idUtil: 0, idRole: 0, idDepartement: 0 };
        this.rechercheAffectation = '';
      },
      error: (err) => {
        alert('⚠️ ' + (err.error || 'Erreur lors de l\'affectation du rôle.'));
      }
    });
  }

  saveDepartement() {
    if (!this.nouveauDepartement.nomDepartement) { alert('Nom requis !'); return; }
    this.http.post(`${this.baseUrl}/Api/departements`, this.nouveauDepartement, { headers: this.getHeaders() })
      .subscribe({ next: () => { this.nouveauDepartement = { nomDepartement: '', nombreEmployes: 0 }; this.loadDepartements(); }, error: () => {} });
  }

  editerDepartement(d: any) { this.departementEdite = { ...d }; }

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

  editerPermission(p: any) { this.permissionEditee = { ...p }; }

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

  deconnecter() {
    localStorage.clear();
    window.location.href = '/login';
  }

  ngOnDestroy() {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
  }

  chargerNotifications() {
    this.notifService.getAll().subscribe({
      next: (notifs) => this.notifications = notifs,
      error: () => {}
    });
  }

  verifierChangementsStatutAdmin() {
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
              this.http.post(`${this.baseUrl}/Api/notifications`, {
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

  demarrerPolling() {}

  toggleNotifApp() {
    this.http.put(
      `${this.baseUrl}/Api/utilisateurs/me/preferences`,
      { notifApp: this.notifApp },
      { headers: this.getHeaders() }
    ).subscribe({ next: () => {}, error: () => {} });
    this.cdr.detectChanges();
  }
}