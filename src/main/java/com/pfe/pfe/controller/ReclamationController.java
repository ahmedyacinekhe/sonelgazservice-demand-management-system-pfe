package com.pfe.pfe.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.http.MediaType;
import com.pfe.pfe.entity.Reclamation;
import com.pfe.pfe.entity.Utilisateur;
import com.pfe.pfe.repository.UtilisateurRepository;
import com.pfe.pfe.service.ReclamationService;

@RestController
@RequestMapping("/Api/reclamations")
public class ReclamationController {

    @Autowired
    private ReclamationService reclamationService;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @GetMapping
    public List<Reclamation> findAll() {
        return reclamationService.findAll();
    }

    @GetMapping("/{id}")
    public Reclamation findById(@PathVariable int id) {
        return reclamationService.findById(id);
    }

    @PostMapping
    public Reclamation save(@RequestBody Reclamation reclamation,
                            @AuthenticationPrincipal UserDetails userDetails) {
        // Date automatique
        reclamation.setDateDemande(new java.sql.Date(System.currentTimeMillis()));

        // Récupérer l'utilisateur connecté
        Utilisateur utilisateur = utilisateurRepository.findByEmailUtil(userDetails.getUsername()).orElse(null);
        reclamation.setUtilisateur(utilisateur);

        return reclamationService.save(reclamation);
    }

    @PutMapping("/{id}")
    public Reclamation update(@PathVariable int id, @RequestBody Reclamation reclamation) {
        return reclamationService.save(reclamation);
    }

    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable int id) {
        reclamationService.deleteById(id);
    }
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public Reclamation save(
        @RequestPart("data") @org.springframework.web.bind.annotation.RequestBody Reclamation reclamation,
        @RequestPart(value = "fichier", required = false) MultipartFile fichier,
        @AuthenticationPrincipal UserDetails userDetails) throws java.io.IOException {

    reclamation.setDateDemande(new java.sql.Date(System.currentTimeMillis()));
    Utilisateur utilisateur = utilisateurRepository.findByEmailUtil(userDetails.getUsername()).orElse(null);
    reclamation.setUtilisateur(utilisateur);

    // ✅ Sauvegarder le fichier si présent
    if (fichier != null && !fichier.isEmpty()) {
        String nomFichier = java.util.UUID.randomUUID() + "_" + fichier.getOriginalFilename();
        java.nio.file.Path chemin = java.nio.file.Paths.get("uploads/" + nomFichier);
        new java.io.File("uploads/").mkdirs();
        java.nio.file.Files.copy(fichier.getInputStream(), chemin,
            java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        reclamation.setPieceJointe(nomFichier);
    }

    return reclamationService.save(reclamation);
}
}