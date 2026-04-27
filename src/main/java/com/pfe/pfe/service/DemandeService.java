package com.pfe.pfe.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pfe.pfe.entity.Demande;
import com.pfe.pfe.repository.DemandeRepository;

@Service
public class DemandeService {
    @Autowired
    private DemandeRepository demandeRepository;

    public List<Demande> findAll(){
        return demandeRepository.findAll();
    }

    public Demande findById(int id){
        return demandeRepository.findById(id).orElse(null);
    }
    public Demande save(Demande demande){
        return demandeRepository.save(demande);
    }

    public void deleteById(int id){
        demandeRepository.deleteById(id);
    }
}
