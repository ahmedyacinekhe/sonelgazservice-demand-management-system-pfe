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

import com.pfe.pfe.entity.Proposition;
import com.pfe.pfe.entity.Utilisateur;
import com.pfe.pfe.repository.UtilisateurRepository;
import com.pfe.pfe.service.PropositionService;

@RestController
@RequestMapping("/Api/propositions")
public class PropositionController {

    @Autowired
    private PropositionService propositionService;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @GetMapping
    public List<Proposition> findAll() {
        return propositionService.findAll();
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

        return propositionService.save(proposition);
    }

    @PutMapping("/{id}")
    public Proposition update(@PathVariable int id, @RequestBody Proposition proposition) {
        return propositionService.save(proposition);
    }

    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable int id) {
        propositionService.deleteById(id);
    }
}