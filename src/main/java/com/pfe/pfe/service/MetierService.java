package com.pfe.pfe.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pfe.pfe.entity.Metier;

import com.pfe.pfe.repository.MetierRepository;

@Service
public class MetierService {
    @Autowired
    private MetierRepository metierRepository;

    public List<Metier> findAll(){
        return metierRepository.findAll();
    }


    public Metier findById(int id){
        return metierRepository.findById(id).orElse(null);

    }
    
    public Metier save(Metier metier){
        return metierRepository.save(metier);
    }

    public void deleteById(int id){
        metierRepository.deleteById(id);
    }
}


    

