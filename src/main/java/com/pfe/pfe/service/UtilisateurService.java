package com.pfe.pfe.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.pfe.pfe.entity.Employe;
import com.pfe.pfe.entity.Utilisateur;
import com.pfe.pfe.entity.Departement;
import com.pfe.pfe.repository.UtilisateurRepository;
import com.pfe.pfe.repository.DepartementRepository;

@Service
public class UtilisateurService {
    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private DepartementRepository departementRepository;

    public List<Utilisateur> findAll(){
        return utilisateurRepository.findAll(Sort.by(Sort.Direction.ASC, "idUtil"));
    }

    public Utilisateur findById(int id){
        return utilisateurRepository.findById(id).orElse(null);
    }

    public Utilisateur save(Utilisateur utilisateur){
        return utilisateurRepository.save(utilisateur);
    }

    public void deleteById(int id){
        // Vérifier si c'est un employé avec un département
        Utilisateur utilisateur = utilisateurRepository.findById(id).orElse(null);
        if (utilisateur instanceof Employe employe) {
            Departement departement = employe.getDepartement();
            if (departement != null && departement.getNombreEmployes() > 0) {
                departement.setNombreEmployes(departement.getNombreEmployes() - 1);
                departementRepository.save(departement);
            }
        }
        utilisateurRepository.deleteById(id);
    }
}