package com.pfe.pfe.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/Api/fichiers")
public class FichierController {

    // Dossier où les fichiers seront stockés
    private final String uploadDir = "uploads/";

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFichier(@RequestParam("fichier") MultipartFile fichier) {
        try {
            // Créer le dossier s'il n'existe pas
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            // Nom unique pour éviter les conflits
            String nomFichier = UUID.randomUUID() + "_" + fichier.getOriginalFilename();
            Path chemin = Paths.get(uploadDir + nomFichier);
            Files.copy(fichier.getInputStream(), chemin, StandardCopyOption.REPLACE_EXISTING);

            return ResponseEntity.ok(Map.of("nomFichier", nomFichier));

        } catch (IOException e) {
            return ResponseEntity.status(500).body("Erreur upload : " + e.getMessage());
        }
    }

    @GetMapping("/download/{nomFichier}")
    public ResponseEntity<org.springframework.core.io.Resource> downloadFichier(
            @PathVariable String nomFichier) throws IOException {
        Path chemin = Paths.get(uploadDir + nomFichier);
        org.springframework.core.io.Resource resource =
            new org.springframework.core.io.UrlResource(chemin.toUri());

        if (!resource.exists()) return ResponseEntity.notFound().build();

        return ResponseEntity.ok()
            .header("Content-Disposition", "attachment; filename=\"" + nomFichier + "\"")
            .body(resource);
    }
}