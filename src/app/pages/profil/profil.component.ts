import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.css'
})
export class ProfilComponent implements OnInit {

  employe = {
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

  photoUrl = 'assets/default-avatar.png';

  ngOnInit() {
    // on chargera les données du backend ici
  }

  updateProfil() {
    console.log('Modifier profil', this.employe);
  }

  updatePassword() {
    if (this.passwords.nouveau !== this.passwords.confirmer) {
      alert('Les mots de passe ne correspondent pas !');
      return;
    }
    console.log('Modifier mot de passe');
  }

  deleteCompte() {
    if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ?')) {
      console.log('Supprimer compte');
    }
  }
  selectedFile: File | null = null;
  onPhotoChange(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.selectedFile = file;  // ← ajoute cette ligne
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.photoUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}
  savePhoto() {
  if (!this.selectedFile) {
    alert('Veuillez choisir une photo !');
    return;
  }
  // on liera avec le backend plus tard
  alert('Photo enregistrée avec succès !');
}
}
