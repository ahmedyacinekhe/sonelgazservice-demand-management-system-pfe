package com.pfe.pfe.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pfe.pfe.entity.Filiale;
import com.pfe.pfe.repository.FilialeRepository;

@Service
public class FilialeService {
    @Autowired
    private FilialeRepository filialeRepository;


    public List<Filiale> findAll(){
        return filialeRepository.findAll();
    }

    public Filiale findById(int Id ){
        return filialeRepository.findById(Id).orElse(null);
    }
    public Filiale save(Filiale filiale){
        return filialeRepository.save(filiale);
    }

    public void deleteById(int Id){
        filialeRepository.deleteById(Id);
    }
    
}
