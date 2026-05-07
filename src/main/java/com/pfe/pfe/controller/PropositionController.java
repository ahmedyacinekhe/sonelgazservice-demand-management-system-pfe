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
import com.pfe.pfe.service.PropositionService;

import jakarta.transaction.Transactional;

import com.pfe.pfe.service.DemandeEtatDetailService;
import com.pfe.pfe.repository.DemandeEtatDetailRepository;

@RestController
@RequestMapping("/Api/propositions")
public class PropositionController {

    @Autowired private PropositionService propositionService;
    @Autowired private UtilisateurRepository utilisateurRepository;
    @Autowired private DemandeEtatDetailService demandeEtatDetailService;
    @Autowired private DemandeEtatDetailRepository demandeEtatDetailRepository;

    @GetMapping
    public List<Proposition> findAll() {
        return propositionService.findAll();
    }

    // ✅ NOUVEAU : seulement les demandes de l'utilisateur connecté
    @GetMapping("/mes-demandes")
    public List<Proposition> getMesDemandes(@AuthenticationPrincipal UserDetails userDetails) {
        return propositionService.findByUtilisateur(userDetails.getUsername());
    }

    @GetMapping("/{id}")
    public Proposition findById(@PathVariable int id) {
        return propositionService.findById(id);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Proposition save(
            @RequestPart("data") Proposition proposition,
            @RequestPart(value = "fichier", required = false) MultipartFile fichier,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {

        proposition.setDateDemande(new java.sql.Date(System.currentTimeMillis()));

        Utilisateur utilisateur = utilisateurRepository
                .findByEmailUtil(userDetails.getUsername()).orElse(null);
        proposition.setUtilisateur(utilisateur);

        if (fichier != null && !fichier.isEmpty()) {
            String nomFichier = UUID.randomUUID() + "_" + fichier.getOriginalFilename();
            Path chemin = Paths.get("uploads/" + nomFichier);
            new File("uploads/").mkdirs();
            Files.copy(fichier.getInputStream(), chemin, StandardCopyOption.REPLACE_EXISTING);
            proposition.setPieceJointe(nomFichier);
        }

        Proposition saved = propositionService.save(proposition);

        DemandeEtatDetail etatDetail = new DemandeEtatDetail();
        DemandeEtatDetailId etatId = new DemandeEtatDetailId();
        etatId.setIdDemande(saved.getIdDemande());
        etatId.setIdEtat(1);
        etatDetail.setDemandeEtatDetailId(etatId);
        etatDetail.setDateEtat(new java.sql.Date(System.currentTimeMillis()));
        demandeEtatDetailService.save(etatDetail);

        return saved;
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Proposition updateWithFile(
            @PathVariable int id,
            @RequestPart("data") Proposition proposition,
            @RequestPart(value = "fichier", required = false) MultipartFile fichier) throws IOException {

        if (fichier != null && !fichier.isEmpty()) {
            String nomFichier = UUID.randomUUID() + "_" + fichier.getOriginalFilename();
            Path chemin = Paths.get("uploads/" + nomFichier);
            new File("uploads/").mkdirs();
            Files.copy(fichier.getInputStream(), chemin, StandardCopyOption.REPLACE_EXISTING);
            proposition.setPieceJointe(nomFichier);
        }
        return propositionService.save(proposition);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public Proposition update(@PathVariable int id, @RequestBody Proposition proposition) {
        return propositionService.save(proposition);
    }

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
        propositionService.deleteById(id);
    }

    @GetMapping("/{id}/etat")
    public String getEtat(@PathVariable int id) {
        List<DemandeEtatDetail> etats = demandeEtatDetailRepository.findByIdDemande(id);
        if (etats.isEmpty()) return "INCONNU";
        return etats.get(0).getEtatDemande().getLibelleEtat();
    }
    @GetMapping("/departement/{idDepartement}")
public List<Proposition> getByDepartement(@PathVariable int idDepartement) {
    return propositionService.findByDepartement(idDepartement);
}
}