package com.pfe.pfe.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import com.pfe.pfe.entity.RoleUtilisateur;
import com.pfe.pfe.entity.RoleUtilisateurId;
import com.pfe.pfe.repository.RoleUtilisateurRepository;

@Service
public class RoleUtilisateurService {

    @Autowired
    private RoleUtilisateurRepository roleUtilisateurRepository;

    public List<RoleUtilisateur> findAll(){
        return roleUtilisateurRepository.findAll();
    }

    public RoleUtilisateur findById(RoleUtilisateurId id){
        return roleUtilisateurRepository.findById(id).orElse(null);
    }
    
    public RoleUtilisateur save(RoleUtilisateur roleUtilisateur){
        return roleUtilisateurRepository.save(roleUtilisateur);
    }

    public void deleteById(RoleUtilisateurId id){
        roleUtilisateurRepository.deleteById(id);
    }
}
