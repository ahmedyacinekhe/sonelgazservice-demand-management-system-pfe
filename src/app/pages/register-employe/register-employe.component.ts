import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register-employe',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register-employe.component.html',
  styleUrl: './register-employe.component.css'
})
export class RegisterEmployeComponent implements OnInit {

  countries = [
    { name: 'Algérie',       flag: '🇩🇿', dialCode: '+213', digits: 9,  placeholder: '5XX XXX XXX'  },
    { name: 'France',        flag: '🇫🇷', dialCode: '+33',  digits: 9,  placeholder: '6XX XXX XXX'  },
    { name: 'Maroc',         flag: '🇲🇦', dialCode: '+212', digits: 9,  placeholder: '6XX XXX XXX'  },
    { name: 'Tunisie',       flag: '🇹🇳', dialCode: '+216', digits: 8,  placeholder: 'XX XXX XXX'   },
    { name: 'Égypte',        flag: '🇪🇬', dialCode: '+20',  digits: 10, placeholder: '1XX XXX XXXX' },
    { name: 'Espagne',       flag: '🇪🇸', dialCode: '+34',  digits: 9,  placeholder: '6XX XXX XXX'  },
    { name: 'Italie',        flag: '🇮🇹', dialCode: '+39',  digits: 10, placeholder: '3XX XXX XXXX' },
    { name: 'Allemagne',     flag: '🇩🇪', dialCode: '+49',  digits: 10, placeholder: '1XX XXXXXXX'  },
    { name: 'Royaume-Uni',   flag: '🇬🇧', dialCode: '+44',  digits: 10, placeholder: '7XXX XXXXXX'  },
    { name: 'États-Unis',    flag: '🇺🇸', dialCode: '+1',   digits: 10, placeholder: 'XXX XXX XXXX' },
    { name: 'Canada',        flag: '🇨🇦', dialCode: '+1',   digits: 10, placeholder: 'XXX XXX XXXX' },
    { name: 'Arabie Saoudite', flag: '🇸🇦', dialCode: '+966', digits: 9, placeholder: '5XX XXX XXX'},
    { name: 'Émirats',       flag: '🇦🇪', dialCode: '+971', digits: 9,  placeholder: '5XX XXX XXX'  },
    { name: 'Turquie',       flag: '🇹🇷', dialCode: '+90',  digits: 10, placeholder: '5XX XXX XXXX' },
  ];

  departements: any[] = [];
  today = new Date().toISOString().split('T')[0];
  selectedCountry = this.countries[0];
  phoneNumber = '';

  employe = {
    nomUtil: '',
    prenomUtil: '',
    emailUtil: '',
    motDePasse: '',
    numTel: 0 as number,
    matricule: 0,
    dateEmbauche: '',
    nomDepartement: ''
  };

  confirmerMotDePasse = '';
  errorMessage = '';
  successMessage = '';
  loading = false;
  showPassword = false;
  showConfirm = false;
  currentYear = new Date().getFullYear();

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadDepartements();
  }

  loadDepartements() {
    // sans token car c'est public
    this.http.get<any[]>('http://localhost:8082/Api/departements').subscribe({
      next: (data) => {
        this.departements = data;
        console.log('Départements chargés:', data);
      },
      error: (err) => {
        console.error('Erreur chargement départements:', err);
      }
    });
  }

  onCountryChange() {
    this.phoneNumber = '';
    this.employe.numTel = 0;
  }

  onPhoneChange() {
  const digits = this.phoneNumber.replace(/\D/g, '');
  this.employe.numTel = Number(this.selectedCountry.dialCode.replace('+', '') + digits) || 0;
}

  isPhoneValid(): boolean {
    const digits = this.phoneNumber.replace(/\D/g, '');
    return digits.length === this.selectedCountry.digits;
  }

  hasUpper(pwd: string): boolean { return /[A-Z]/.test(pwd); }
  hasDigit(pwd: string): boolean { return /\d/.test(pwd); }
  hasSpecial(pwd: string): boolean { return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd); }

  register() {
    const pwd = this.employe.motDePasse;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,12}$/;

    if (this.phoneNumber && !this.isPhoneValid()) {
      this.errorMessage = `Le numéro doit contenir exactement ${this.selectedCountry.digits} chiffres pour ${this.selectedCountry.name} (${this.selectedCountry.dialCode}).`;
      return;
    }

    if (!passwordRegex.test(pwd)) {
      this.errorMessage = 'Le mot de passe doit contenir 8 à 12 caractères, au moins une majuscule, un chiffre et un caractère spécial.';
      return;
    }

    if (pwd !== this.confirmerMotDePasse) {
      this.errorMessage = 'Les mots de passe ne correspondent pas !';
      return;
    }

    if (!this.employe.nomDepartement) {
      this.errorMessage = 'Veuillez choisir un département.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    console.log('Données envoyées:', this.employe);

    this.http.post('http://localhost:8082/auth/register/employe', this.employe,
      { responseType: 'text' }
    ).subscribe({
      next: (_response) => {
        this.successMessage = 'Compte créé avec succès !';
        this.loading = false;
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        console.error('Erreur register:', err);
        this.errorMessage = err.error || 'Erreur lors de la création du compte !';
        this.loading = false;
      }
    });
  }
}