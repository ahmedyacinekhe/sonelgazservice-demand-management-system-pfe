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

  nouveauDepartement  = { nomDepartement: '', descriptionDepartement: '' };
  departementEdite: any = null;
  nouvellePermission  = { nomPermission: '', descriptionPermission: '' };
  permissionEditee: any = null;
  nouveauRole         = { nomRole: '', descriptionRole: '' };
  roleEdite: any      = null;
  affectation         = { idUtil: 0, idRole: 0 };

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
    this.http.get<any>(`${this.baseUrl}/Api/utilisateurs/me`, { headers: this.getHeaders() })
      .subscribe({
        next: (u) => {
          this.prenomUtilisateur     = u.prenomUtil  || '';
          this.nomFamilleUtilisateur = u.nomUtil     || '';
          this.nomUtilisateur        = `${u.prenomUtil || ''} ${u.nomUtil || ''}`.trim() || 'Administrateur';
          this.emailUtilisateur      = u.emailUtil   || this.emailUtilisateur;
          this.telUtilisateur        = u.numTel      || '';
          const lr = this.authService.getRole();
          if (lr) {
            this.roleUtilisateur = lr;
          }
        },
        error: () => {}
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