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

import com.pfe.pfe.entity.Requete;
import com.pfe.pfe.entity.Utilisateur;
import com.pfe.pfe.repository.UtilisateurRepository;
import com.pfe.pfe.service.RequeteService;

@RestController
@RequestMapping("/Api/requetes")
public class RequeteController {

    @Autowired
    private RequeteService requeteService;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @GetMapping
    public List<Requete> findAll() {
        return requeteService.findAll();
    }

    @GetMapping("/{id}")
    public Requete findById(@PathVariable int id) {
        return requeteService.findById(id);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Requete save(
            @RequestPart("data") Requete requete,
            @RequestPart(value = "fichier", required = false) MultipartFile fichier,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {

        requete.setDateDemande(new java.sql.Date(System.currentTimeMillis()));

        Utilisateur utilisateur = utilisateurRepository
                .findByEmailUtil(userDetails.getUsername()).orElse(null);
        requete.setUtilisateur(utilisateur);

        if (fichier != null && !fichier.isEmpty()) {
            String nomFichier = UUID.randomUUID() + "_" + fichier.getOriginalFilename();
            Path chemin = Paths.get("uploads/" + nomFichier);
            new File("uploads/").mkdirs();
            Files.copy(fichier.getInputStream(), chemin, StandardCopyOption.REPLACE_EXISTING);
            requete.setPieceJointe(nomFichier);
        }

        return requeteService.save(requete);
    }

    @PutMapping("/{id}")
    public Requete update(@PathVariable int id, @RequestBody Requete requete) {
        return requeteService.save(requete);
    }

    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable int id) {
        requeteService.deleteById(id);
    }
}