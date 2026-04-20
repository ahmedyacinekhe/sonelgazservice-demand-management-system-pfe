package com.pfe.pfe.service;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import com.pfe.pfe.entity.Requete;
import com.pfe.pfe.repository.RequeteRepository;

@Service
public class RequeteService {
 @Autowired
 private RequeteRepository requeteRepository ;


    public List<Requete> findAll(){
        return requeteRepository.findAll();
    }
    
    public Requete findById(int id){
        return requeteRepository.findById(id).orElse(null);
    }

    public Requete save(Requete requete){
        return requeteRepository.save(requete);
    }

    public void deleteById(int id){
        requeteRepository.deleteById(id);
    }
}
