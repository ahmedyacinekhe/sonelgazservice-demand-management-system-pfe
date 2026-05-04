import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: 'app-demandes',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './demandes.component.html',
  styleUrl: './demandes.component.css'
})
export class DemandesComponent {
  // Ce composant est juste la page d'accueil avec les 3 cartes
}