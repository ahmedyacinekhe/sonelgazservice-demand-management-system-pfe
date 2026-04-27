package com.pfe.pfe.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pfe.pfe.entity.Reclamation;
import com.pfe.pfe.repository.ReclamationRepository;

@Service
public class ReclamationService {

    @Autowired
    private ReclamationRepository reclamationRepository ;

    public List<Reclamation> findAll(){
        return reclamationRepository.findAll();
    }

    public Reclamation findById(int id){
        return reclamationRepository.findById(id).orElse(null);
    }

    public Reclamation save(Reclamation reclamation){
        return reclamationRepository.save(reclamation);
    }

    public void deleteById(int id){
        reclamationRepository.deleteById(id);
    }

  
    
}
