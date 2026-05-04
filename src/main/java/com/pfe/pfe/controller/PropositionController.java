package com.pfe.pfe.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pfe.pfe.entity.Proposition;
import com.pfe.pfe.entity.Utilisateur;
import com.pfe.pfe.service.PropositionService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.pfe.pfe.repository.UtilisateurRepository;


@RestController
@RequestMapping("/Api/propositions")
public class PropositionController {
    @Autowired
    private PropositionService propositionService;
@Autowired
private UtilisateurRepository utilisateurRepository;
    @GetMapping
    public List<Proposition> findAll(){
        return propositionService.findAll();

    }
    @GetMapping("/{id}")
    public Proposition findById(@PathVariable int id){
        return propositionService.findById(id);
    }
    @PostMapping
public Proposition save(@RequestBody Proposition proposition, 
                        @AuthenticationPrincipal UserDetails userDetails) {
    // Date automatique
    proposition.setDateDemande(new java.sql.Date(System.currentTimeMillis()));
    
    // Récupérer l'utilisateur connecté
    Utilisateur utilisateur = utilisateurRepository.findByEmailUtil(userDetails.getUsername()).orElse(null);
    proposition.setUtilisateur(utilisateur);
    
    return propositionService.save(proposition);
}
    @PutMapping("/{id}")
    public Proposition update(@PathVariable int id, @RequestBody Proposition proposition){
        return propositionService.save(proposition);
    }
    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable int id){
        propositionService.deleteById(id);
    }
    
}
