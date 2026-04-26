import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {

  showProfil = false;
  activeMenu = 'main';
  showPasswordForm = false;
  compteActif = true;
  selectedLangue = 'fr';

  employe: any = {
    nomUtil: '',
    prenomUtil: '',
    emailUtil: '',
    numTel: ''
  };

  passwords = {
    ancien: '',
    nouveau: '',
    confirmer: ''
  };

  photoUrl = 'assets/profile.png';
  role = '';

  avatarSuggestions = [
    { url: 'assets/profile.png', label: 'Profil' }
  ];

  constructor(private authService: AuthService, private router: Router, private http: HttpClient) {
    const savedPhoto = localStorage.getItem('photoUrl');
    if (savedPhoto) {
      this.photoUrl = savedPhoto;
    }
  }

  ngOnInit() {
    this.role = localStorage.getItem('role') || '';
    this.loadProfil();
  }

  getDashboardLink(): string {
    if (this.role === 'ADMIN') {
      return '/dashboard-admin';
    }
    return '/dashboard';
  }

  loadProfil() {
    if (this.role === 'CLIENT') {
      this.http.get<any>('http://localhost:8082/Api/clients/me').subscribe({
        next: (data) => { this.employe = data; },
        error: () => { console.log('Erreur chargement profil client'); }
      });
    } else {
      this.http.get<any>('http://localhost:8082/Api/employes/me').subscribe({
        next: (data) => { this.employe = data; },
        error: () => { console.log('Erreur chargement profil employé'); }
      });
    }
  }

  toggleProfil() {
    this.showProfil = !this.showProfil;
    if (!this.showProfil) {
      this.activeMenu = 'main';
      this.showPasswordForm = false;
    }
  }

  selectAvatar(url: string) {
    this.photoUrl = url;
    localStorage.setItem('photoUrl', url);
  }

  onPhotoChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoUrl = e.target.result;
        localStorage.setItem('photoUrl', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  saveInfos() {
    alert('Informations enregistrées avec succès !');
    this.activeMenu = 'main';
  }

  updatePassword() {
    if (!this.passwords.ancien || !this.passwords.nouveau) {
      alert('Veuillez remplir tous les champs !');
      return;
    }
    if (this.passwords.nouveau !== this.passwords.confirmer) {
      alert('Les mots de passe ne correspondent pas !');
      return;
    }
    alert('Mot de passe modifié avec succès !');
    this.passwords = { ancien: '', nouveau: '', confirmer: '' };
    this.showPasswordForm = false;
  }

  toggleCompte() {
    const etat = this.compteActif ? 'activé' : 'désactivé';
    alert(`Compte ${etat} avec succès !`);
  }

  logout() {
    this.authService.logout();
  }
}