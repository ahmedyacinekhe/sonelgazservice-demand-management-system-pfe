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
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.pfe.pfe.entity.*;
import com.pfe.pfe.repository.UtilisateurRepository;
import com.pfe.pfe.service.ReclamationService;

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

    @GetMapping
    public List<Reclamation> findAll() {
        return reclamationService.findAll();
    }

    @GetMapping("/{id}")
    public Reclamation findById(@PathVariable int id) {
        return reclamationService.findById(id);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Reclamation save(
            @RequestPart("data") Reclamation reclamation,
            @RequestPart(value = "fichier", required = false) MultipartFile fichier,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {

        reclamation.setDateDemande(new java.sql.Date(System.currentTimeMillis()));

        Utilisateur utilisateur = utilisateurRepository
                .findByEmailUtil(userDetails.getUsername()).orElse(null);
        reclamation.setUtilisateur(utilisateur);

        if (fichier != null && !fichier.isEmpty()) {
            String nomFichier = UUID.randomUUID() + "_" + fichier.getOriginalFilename();
            Path chemin = Paths.get("uploads/" + nomFichier);
            new File("uploads/").mkdirs();
            Files.copy(fichier.getInputStream(), chemin, StandardCopyOption.REPLACE_EXISTING);
            reclamation.setPieceJointe(nomFichier);
        }

        Reclamation saved = reclamationService.save(reclamation);

        // ✅ Statut BROUILLON automatique (id_etat = 1)
        DemandeEtatDetail etatDetail = new DemandeEtatDetail();
        DemandeEtatDetailId etatId = new DemandeEtatDetailId();
        etatId.setIdDemande(saved.getIdDemande());
        etatId.setIdEtat(1); // BROUILLON
        etatDetail.setDemandeEtatDetailId(etatId);
        etatDetail.setDateEtat(new java.sql.Date(System.currentTimeMillis()));
        demandeEtatDetailService.save(etatDetail);

        return saved;
    }

    // ✅ Modifier une demande BROUILLON (avec fichier)
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

    // ✅ Modifier sans fichier (JSON simple)
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public Reclamation update(@PathVariable int id, @RequestBody Reclamation reclamation) {
        return reclamationService.save(reclamation);
    }

    // ✅ Changer le statut : BROUILLON → EN_ATTENTE
    @PutMapping("/{id}/statut/{idEtat}")
    public void changerStatut(@PathVariable int id, @PathVariable int idEtat) {
        demandeEtatDetailRepository.deleteByIdDemande(id);

        DemandeEtatDetail etatDetail = new DemandeEtatDetail();
        DemandeEtatDetailId etatDetailId = new DemandeEtatDetailId();
        etatDetailId.setIdDemande(id);
        etatDetailId.setIdEtat(idEtat);
        etatDetail.setDemandeEtatDetailId(etatDetailId);
        etatDetail.setDateEtat(new java.sql.Date(System.currentTimeMillis()));
        demandeEtatDetailService.save(etatDetail);
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
}