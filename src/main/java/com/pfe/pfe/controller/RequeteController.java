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
import org.springframework.web.bind.annotation.RestController;

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

    @PostMapping
    public Requete save(@RequestBody Requete requete,
                        @AuthenticationPrincipal UserDetails userDetails) {
        // Date automatique
        requete.setDateDemande(new java.sql.Date(System.currentTimeMillis()));

        // Récupérer l'utilisateur connecté
        Utilisateur utilisateur = utilisateurRepository.findByEmailUtil(userDetails.getUsername()).orElse(null);
        requete.setUtilisateur(utilisateur);

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