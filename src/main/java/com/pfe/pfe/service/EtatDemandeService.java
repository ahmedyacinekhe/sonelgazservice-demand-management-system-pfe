package com.pfe.pfe.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import com.pfe.pfe.entity.EtatDemande;
import com.pfe.pfe.repository.EtatDemandeRepository;

@Service
public class EtatDemandeService {
    @Autowired
    private EtatDemandeRepository etatDemandeRepository;

    public List<EtatDemande> findAll(){
        return etatDemandeRepository.findAll();
    }

    public EtatDemande findById(int id){
        return etatDemandeRepository.findById(id).orElse(null);
    }

    public EtatDemande save(EtatDemande etatDemande){
        return etatDemandeRepository.save(etatDemande);
    }
    
    public void deleteById(int id){
        etatDemandeRepository.deleteById(id);
    }
}
