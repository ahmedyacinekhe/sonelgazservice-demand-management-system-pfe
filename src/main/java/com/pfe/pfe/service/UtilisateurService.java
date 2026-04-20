package com.pfe.pfe.service;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pfe.pfe.entity.Utilisateur;
import com.pfe.pfe.repository.UtilisateurRepository;

@Service
public class UtilisateurService {
    @Autowired
    private UtilisateurRepository utilisateurRepository;
    
    public List<Utilisateur> findAll(){
        return utilisateurRepository.findAll();
    }


    public Utilisateur findById(int id){
        return utilisateurRepository.findById(id).orElse(null);

    }
    
    public Utilisateur save(Utilisateur utilisateur){
        return utilisateurRepository.save(utilisateur);
    }

    public void deleteById(int id){
        utilisateurRepository.deleteById(id);
    }
}

