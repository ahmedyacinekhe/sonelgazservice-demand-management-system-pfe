package com.pfe.pfe.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pfe.pfe.entity.Utilisateur;
import com.pfe.pfe.service.UtilisateurService;

@RestController
@RequestMapping("/Api/utilisateurs")
public class UtilisateurController {
    @Autowired
    private UtilisateurService utilisateurService;

    @GetMapping
    public List<Utilisateur> findAll(){
        return utilisateurService.findAll();
    }

    @GetMapping("/{id}")
    public Utilisateur findById(@PathVariable int id){
        return utilisateurService.findById(id);
    }

    @PostMapping
    public Utilisateur save(@RequestBody Utilisateur utilisateur){
        return utilisateurService.save(utilisateur);
    }

    @PutMapping("/{id}")
    public Utilisateur  update(@PathVariable int id, @RequestBody Utilisateur utilisateur){
        return utilisateurService.save(utilisateur);
    }

    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable int id){
        utilisateurService.deleteById(id);
    }



    
}
