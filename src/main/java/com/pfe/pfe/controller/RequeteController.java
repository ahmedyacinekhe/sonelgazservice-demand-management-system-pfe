package com.pfe.pfe.controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.pfe.pfe.entity.*;
import com.pfe.pfe.repository.UtilisateurRepository;
import com.pfe.pfe.service.RequeteService;

import jakarta.transaction.Transactional;

import com.pfe.pfe.service.DemandeEtatDetailService;
import com.pfe.pfe.repository.DemandeEtatDetailRepository;

@RestController
@RequestMapping("/Api/requetes")
public class RequeteController {

    @Autowired private RequeteService requeteService;
    @Autowired private UtilisateurRepository utilisateurRepository;
    @Autowired private DemandeEtatDetailService demandeEtatDetailService;
    @Autowired private DemandeEtatDetailRepository demandeEtatDetailRepository;

    @GetMapping
    public List<Requete> findAll() {
        return requeteService.findAll();
    }

    @GetMapping("/mes-demandes")
    public List<Requete> getMesDemandes(@AuthenticationPrincipal UserDetails userDetails) {
        return requeteService.findByUtilisateur(userDetails.getUsername());
    }

    @GetMapping("/{id}")
    public Requete findById(@PathVariable int id) {
        return requeteService.findById(id);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> save(
            @RequestPart("data") Requete requete,
            @RequestPart(value = "fichier", required = false) MultipartFile fichier,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {

        // Création en BROUILLON (id_etat=1), pas de vérification
        Utilisateur utilisateur = utilisateurRepository
                .findByEmailUtil(userDetails.getUsername()).orElse(null);

        requete.setDateDemande(new java.sql.Date(System.currentTimeMillis()));
        requete.setUtilisateur(utilisateur);

        if (fichier != null && !fichier.isEmpty()) {
            String nomFichier = UUID.randomUUID() + "_" + fichier.getOriginalFilename();
            Path chemin = Paths.get("uploads/" + nomFichier);
            new File("uploads/").mkdirs();
            Files.copy(fichier.getInputStream(), chemin, StandardCopyOption.REPLACE_EXISTING);
            requete.setPieceJointe(nomFichier);
        }

        Requete saved = requeteService.save(requete);

        DemandeEtatDetail etatDetail = new DemandeEtatDetail();
        DemandeEtatDetailId etatId = new DemandeEtatDetailId();
        etatId.setIdDemande(saved.getIdDemande());
        etatId.setIdEtat(1); // BROUILLON
        etatDetail.setDemandeEtatDetailId(etatId);
        etatDetail.setDateEtat(new java.sql.Date(System.currentTimeMillis()));
        demandeEtatDetailService.save(etatDetail);

        return ResponseEntity.ok(saved);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Requete updateWithFile(
            @PathVariable int id,
            @RequestPart("data") Requete requete,
            @RequestPart(value = "fichier", required = false) MultipartFile fichier) throws IOException {

        if (fichier != null && !fichier.isEmpty()) {
            String nomFichier = UUID.randomUUID() + "_" + fichier.getOriginalFilename();
            Path chemin = Paths.get("uploads/" + nomFichier);
            new File("uploads/").mkdirs();
            Files.copy(fichier.getInputStream(), chemin, StandardCopyOption.REPLACE_EXISTING);
            requete.setPieceJointe(nomFichier);
        }
        return requeteService.save(requete);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public Requete update(@PathVariable int id, @RequestBody Requete requete) {
        return requeteService.save(requete);
    }

    // ← Vérification ici au moment de la soumission (passage à EN_ATTENTE)
    @PutMapping("/{id}/statut/{idEtat}")
    public ResponseEntity<?> changerStatut(
            @PathVariable int id,
            @PathVariable int idEtat,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Vérification uniquement quand on soumet (id_etat=2 = EN_ATTENTE)
        if (idEtat == 2) {
            Utilisateur utilisateur = utilisateurRepository
                    .findByEmailUtil(userDetails.getUsername()).orElse(null);

            if (utilisateur != null) {
                long nbNonTraitees = demandeEtatDetailRepository
                        .countDemandesNonTraiteesParUtilisateur(utilisateur.getIdUtil());
                if (nbNonTraitees >= 3) {
                    return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                            .body("Vous avez atteint le maximum de 3 demandes en attente. Veuillez attendre qu'elles soient traitées avant d'en soumettre une nouvelle.");
                }
            }
        }

        demandeEtatDetailRepository.deleteByIdDemande(id);

        DemandeEtatDetail etatDetail = new DemandeEtatDetail();
        DemandeEtatDetailId etatDetailId = new DemandeEtatDetailId();
        etatDetailId.setIdDemande(id);
        etatDetailId.setIdEtat(idEtat);
        etatDetail.setDemandeEtatDetailId(etatDetailId);
        etatDetail.setDateEtat(new java.sql.Date(System.currentTimeMillis()));
        demandeEtatDetailService.save(etatDetail);

        return ResponseEntity.ok("Statut mis à jour");
    }

    @DeleteMapping("/{id}")
    @Transactional
    public void deleteById(@PathVariable int id) {
        demandeEtatDetailRepository.deleteByIdDemande(id);
        requeteService.deleteById(id);
    }

    @GetMapping("/{id}/etat")
    public String getEtat(@PathVariable int id) {
        List<DemandeEtatDetail> etats = demandeEtatDetailRepository.findByIdDemande(id);
        if (etats.isEmpty()) return "INCONNU";
        return etats.get(0).getEtatDemande().getLibelleEtat();
    }

    @GetMapping("/departement/{idDepartement}")
    public List<Requete> getByDepartement(@PathVariable int idDepartement) {
        return requeteService.findByDepartement(idDepartement);
    }
}