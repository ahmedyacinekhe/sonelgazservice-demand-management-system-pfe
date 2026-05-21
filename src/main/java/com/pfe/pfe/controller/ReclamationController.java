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
import com.pfe.pfe.service.ReclamationService;
import com.pfe.pfe.service.NotificationService;

import jakarta.transaction.Transactional;

import com.pfe.pfe.service.DemandeEtatDetailService;
import com.pfe.pfe.repository.DemandeEtatDetailRepository;

@RestController
@RequestMapping("/Api/reclamations")
public class ReclamationController {

    @Autowired private ReclamationService reclamationService;
    @Autowired private UtilisateurRepository utilisateurRepository;
    @Autowired private DemandeEtatDetailService demandeEtatDetailService;
    @Autowired private DemandeEtatDetailRepository demandeEtatDetailRepository;
    @Autowired private NotificationService notificationService;

    @GetMapping
    public List<Reclamation> findAll() {
        return reclamationService.findAll();
    }

    @GetMapping("/mes-demandes")
    public List<java.util.Map<String, Object>> getMesDemandes(@AuthenticationPrincipal UserDetails userDetails) {
        List<Reclamation> demandes = reclamationService.findByUtilisateur(userDetails.getUsername());
        return demandes.stream().map(d -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("idDemande", d.getIdDemande());
            map.put("description", d.getDescription());
            map.put("dateDemande", d.getDateDemande());
            map.put("typeReclamation", d.getTypeReclamation());
            map.put("niveauUrgence", d.getNiveauUrgence());
            map.put("pieceJointe", d.getPieceJointe());

            if (d.getDepartement() != null) {
                java.util.Map<String, Object> dep = new java.util.HashMap<>();
                dep.put("idDepartement", d.getDepartement().getIdDepartement());
                dep.put("nomDepartement", d.getDepartement().getNomDepartement());
                map.put("departement", dep);
            }

            List<DemandeEtatDetail> etats = demandeEtatDetailRepository.findByIdDemande(d.getIdDemande());
            String statut = etats.isEmpty() ? "INCONNU" : etats.get(0).getEtatDemande().getLibelleEtat();
            map.put("statut", statut);
            return map;
        }).collect(java.util.stream.Collectors.toList());
    }

    @GetMapping("/{id}")
    public Reclamation findById(@PathVariable int id) {
        return reclamationService.findById(id);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> save(
            @RequestPart("data") Reclamation reclamation,
            @RequestPart(value = "fichier", required = false) MultipartFile fichier,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {

        Utilisateur utilisateur = utilisateurRepository
                .findByEmailUtil(userDetails.getUsername()).orElse(null);

        reclamation.setDateDemande(java.time.LocalDateTime.now());
        reclamation.setUtilisateur(utilisateur);

        if (fichier != null && !fichier.isEmpty()) {
            String nomFichier = UUID.randomUUID() + "_" + fichier.getOriginalFilename();
            Path chemin = Paths.get("uploads/" + nomFichier);
            new File("uploads/").mkdirs();
            Files.copy(fichier.getInputStream(), chemin, StandardCopyOption.REPLACE_EXISTING);
            reclamation.setPieceJointe(nomFichier);
        }

        Reclamation saved = reclamationService.save(reclamation);

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
    public Reclamation updateWithFile(
            @PathVariable int id,
            @RequestPart("data") Reclamation reclamation,
            @RequestPart(value = "fichier", required = false) MultipartFile fichier) throws IOException {

        if (fichier != null && !fichier.isEmpty()) {
            String nomFichier = UUID.randomUUID() + "_" + fichier.getOriginalFilename();
            Path chemin = Paths.get("uploads/" + nomFichier);
            new File("uploads/").mkdirs();
            Files.copy(fichier.getInputStream(), chemin, StandardCopyOption.REPLACE_EXISTING);
            reclamation.setPieceJointe(nomFichier);
        }
        return reclamationService.save(reclamation);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public Reclamation update(@PathVariable int id, @RequestBody Reclamation reclamation) {
        return reclamationService.save(reclamation);
    }

    @PutMapping("/{id}/statut/{idEtat}")
    public ResponseEntity<?> changerStatut(
            @PathVariable int id,
            @PathVariable int idEtat,
            @AuthenticationPrincipal UserDetails userDetails) {

        Utilisateur utilisateur = utilisateurRepository
                .findByEmailUtil(userDetails.getUsername()).orElse(null);

        Reclamation reclamation = reclamationService.findById(id);

        if (idEtat == 2) {
            // Vérification limite 3 demandes
            if (utilisateur != null) {
                long nbNonTraitees = demandeEtatDetailRepository
                        .countDemandesNonTraiteesParUtilisateur(utilisateur.getIdUtil());
                if (nbNonTraitees >= 3) {
                    return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                            .body("Vous avez atteint le maximum de 3 demandes en attente. Veuillez attendre qu'elles soient traitées avant d'en soumettre une nouvelle.");
                }
            }

            // Notifier les responsables du département
            if (reclamation.getDepartement() != null) {
                notificationService.notifierResponsables(
                    reclamation.getDepartement().getIdDepartement(),
                    "Nouvelle réclamation soumise : " + reclamation.getDescription(),
                    "RECLAMATION"
                );
            }

        } else {
            // Notifier le demandeur du changement de statut
            String libelleEtat = switch (idEtat) {
                case 3 -> "EN COURS";
                case 4 -> "TRAITÉE";
                case 5 -> "CLÔTURÉE";
                case 6 -> "ANNULÉE";
                default -> "MISE À JOUR";
            };

            if (reclamation.getUtilisateur() != null) {
                notificationService.envoyer(
                    reclamation.getUtilisateur().getEmailUtil(),
                    "Votre réclamation a été mise à jour : " + libelleEtat,
                    "RECLAMATION"
                );
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
        reclamationService.deleteById(id);
    }

    @GetMapping("/{id}/etat")
    public String getEtat(@PathVariable int id) {
        List<DemandeEtatDetail> etats = demandeEtatDetailRepository.findByIdDemande(id);
        if (etats.isEmpty()) return "INCONNU";
        return etats.get(0).getEtatDemande().getLibelleEtat();
    }

    @GetMapping("/departement/{idDepartement}")
public List<java.util.Map<String, Object>> getByDepartement(@PathVariable int idDepartement) {
    List<Reclamation> demandes = reclamationService.findByDepartement(idDepartement);
    return demandes.stream().map(d -> {
        java.util.Map<String, Object> map = new java.util.HashMap<>();
        map.put("idDemande", d.getIdDemande());
        map.put("description", d.getDescription());
        map.put("dateDemande", d.getDateDemande());
        map.put("typeReclamation", d.getTypeReclamation());
        map.put("niveauUrgence", d.getNiveauUrgence());
        map.put("pieceJointe", d.getPieceJointe());
        if (d.getUtilisateur() != null) {
            java.util.Map<String, Object> u = new java.util.HashMap<>();
            u.put("prenomUtil", d.getUtilisateur().getPrenomUtil());
            u.put("nomUtil", d.getUtilisateur().getNomUtil());
            u.put("emailUtil", d.getUtilisateur().getEmailUtil());
            map.put("utilisateur", u);
        }
        List<DemandeEtatDetail> etats = demandeEtatDetailRepository.findByIdDemande(d.getIdDemande());
        String statut = etats.isEmpty() ? "EN_ATTENTE" : etats.get(0).getEtatDemande().getLibelleEtat();
        map.put("statut", statut);
        return map;
    }).collect(java.util.stream.Collectors.toList());
}
}