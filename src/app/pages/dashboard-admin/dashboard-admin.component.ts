import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { RequeteService } from '../../core/services/requete.service';
import { ReclamationService } from '../../core/services/reclamation.service';
import { PropositionService } from '../../core/services/proposition.service';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.css'
})
export class DashboardAdminComponent implements OnInit {

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

  editProfil = false;
  profilEdit = { prenomUtil: '', nomUtil: '', numTel: '' };

  mdp = { ancien: '', nouveau: '', confirmer: '' };
  langueSelectionnee = 'fr';
  notifEmail = true;
  notifApp   = true;

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

  // RECHERCHE
  rechercheUtilisateur = '';

  utilisateursFiltres(): any[] {
    const search = this.rechercheUtilisateur.toLowerCase().trim();
    if (!search) return this.utilisateurs;
    return this.utilisateurs.filter(u =>
      (u.nomUtil    || '').toLowerCase().includes(search) ||
      (u.prenomUtil || '').toLowerCase().includes(search)
    );
  }
  rechercheDepartement = '';

  departementsFiltres(): any[] {
    const search = this.rechercheDepartement.toLowerCase().trim();
    if (!search) return this.departements;
    return this.departements.filter(d =>
      (d.nomDepartement || '').toLowerCase().includes(search)
    );
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
  return nom === 'EMPLOYE' || nom === 'RESPONSABLE';
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
    private authService: AuthService,
    private requeteService: RequeteService,
    private reclamationService: ReclamationService,
    private propositionService: PropositionService
  ) {}

  ngOnInit() {
    this.loadAll();
    this.loadCurrentUser();
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

  loadCurrentUser() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.emailUtilisateur = payload.sub || payload.email || 'admin@sonelgaz.dz';
        this.roleUtilisateur  = payload.role || payload.roles?.[0] || 'Admin';
      } catch { /* ignore */ }
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
    if (this.mdp.nouveau !== this.mdp.confirmer) { alert('Les mots de passe ne correspondent pas !'); return; }
    alert('Mot de passe modifié avec succès !');
    this.mdp = { ancien: '', nouveau: '', confirmer: '' };
  }

  changerLangue() {
    const noms: Record<string, string> = { fr: 'Français', ar: 'Arabe', en: 'Anglais' };
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
      this.reclamationService.save({
        description: d.description,
        typeReclamation: d.typeReclamation,
        niveauUrgence: d.niveauUrgence
      }).subscribe({
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
    this.loadUtilisateurs();
    this.loadDepartements();
    this.loadRoles();
    this.loadPermissions();
    this.loadRolesUtilisateurs();
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

  getRoleUtilisateur(idUtil: number): string {
    const ru = this.rolesUtilisateurs.find(r => r.roleUtilisateurId?.idUtil === idUtil);
    return ru ? ru.role?.nomRole : 'AUCUN';
  }

  isPermissionSelected(idPermission: number): boolean {
    return this.nouvellePermissionRole.includes(idPermission);
  }

  togglePermission(idPermission: number) {
    const index = this.nouvellePermissionRole.indexOf(idPermission);
    if (index === -1) {
      this.nouvellePermissionRole.push(idPermission);
    } else {
      this.nouvellePermissionRole.splice(index, 1);
    }
  }

  saveRoleAvecPermissions() {
    if (!this.nouveauRole.nomRole) { alert('Nom requis !'); return; }
    this.http.post<any>(`${this.baseUrl}/Api/roles`, this.nouveauRole, { headers: this.getHeaders() })
      .subscribe({
        next: (role) => {
          const idRole = role.idRole;
          const requests = this.nouvellePermissionRole.map(idPerm =>
            this.http.post(`${this.baseUrl}/Api/rolesPermissions`,
              { rolePermissionId: { idRole, idPermission: idPerm } },
              { headers: this.getHeaders() }
            ).toPromise()
          );
          Promise.all(requests).then(() => {
            this.nouveauRole = { nomRole: '', descriptionRole: '' };
            this.nouvellePermissionRole = [];
            this.loadRoles();
            alert('Rôle créé avec permissions !');
          });
        },
        error: () => alert('Erreur lors de la création du rôle.')
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
    this.http.put(`${this.baseUrl}/Api/utilisateurs/${u.idUtil}`, { ...u, etatCompte: etat }, { headers: this.getHeaders() })
      .subscribe({ next: () => this.loadUtilisateurs(), error: () => {} });
  }

  affecterRole() {
  if (!this.affectation.idUtil || !this.affectation.idRole) {
    alert('Choisissez utilisateur et rôle !');
    return;
  }

  const roleSelectionne = this.roles.find(r => Number(r.idRole) === Number(this.affectation.idRole));
  const nomRole = roleSelectionne ? roleSelectionne.nomRole : '';
  const necessiteDepartement = nomRole.toUpperCase() === 'EMPLOYE' || nomRole.toUpperCase() === 'RESPONSABLE';

  if (necessiteDepartement && !this.affectation.idDepartement) {
    alert('Veuillez choisir un département pour ce rôle !');
    return;
  }

  const idUtil = this.affectation.idUtil;
  const idRole = this.affectation.idRole;
  const idDepartement = this.affectation.idDepartement;

  this.http.delete(
    `${this.baseUrl}/Api/rolesUtilisateurs/utilisateur/${idUtil}`,
    { headers: this.getHeaders() }
  ).subscribe({
    next: () => {
      this.http.post(
        `${this.baseUrl}/Api/rolesUtilisateurs`,
        { roleUtilisateurId: { idUtil, idRole } },
        { headers: this.getHeaders() }
      ).subscribe({
        next: () => {
          // Convertir l'utilisateur dans la bonne table
          this.http.put(
            `${this.baseUrl}/Api/utilisateurs/${idUtil}/convertir?nouveauRole=${nomRole}&idDepartement=${idDepartement}`,
            {},
            { headers: this.getHeaders() }
          ).subscribe({
            next: () => {
              console.log('✅ Conversion réussie');
              this.loadAll();
              if (this.departementSelectionne) {
                setTimeout(() => this.voirEmployesDepartement(this.departementSelectionne), 500);
              }
              alert('Rôle affecté avec succès !');
              this.affectation = { idUtil: 0, idRole: 0, idDepartement: 0 };
              this.rechercheAffectation = '';
            },
            error: (err) => {
              console.error('❌ Erreur conversion:', err);
              alert('Rôle affecté mais erreur lors de la conversion !');
            }
          });
        },
        error: () => alert('Erreur lors de l\'affectation du rôle.')
      });
    },
    error: () => alert('Erreur lors de la suppression de l\'ancien rôle.')
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
}