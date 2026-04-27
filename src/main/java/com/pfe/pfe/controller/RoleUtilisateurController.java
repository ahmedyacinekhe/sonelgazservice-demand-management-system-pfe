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

import com.pfe.pfe.entity.RoleUtilisateur;
import com.pfe.pfe.entity.RoleUtilisateurId;
import com.pfe.pfe.service.RoleUtilisateurService;

@RestController
@RequestMapping("/Api/rolesUtilisateurs")
public class RoleUtilisateurController {
    @Autowired
    private RoleUtilisateurService roleUtilisateurService ;
    @GetMapping
    public List<RoleUtilisateur> findAll(){
        return roleUtilisateurService.findAll();
    }

    @GetMapping("/{id}")
    public RoleUtilisateur findById(@PathVariable RoleUtilisateurId  id){
         return roleUtilisateurService.findById(id);
    } 
    @PostMapping
    public RoleUtilisateur save(@RequestBody RoleUtilisateur roleEmploye){
        return roleUtilisateurService.save(roleEmploye);
    }

    @PutMapping("/{id}")
    public RoleUtilisateur update(@PathVariable RoleUtilisateurId id, @RequestBody RoleUtilisateur roleUtilisateur){
       return roleUtilisateurService.save(roleUtilisateur);
    }
    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable RoleUtilisateurId id){
        roleUtilisateurService.deleteById(id);
    }


    
}
