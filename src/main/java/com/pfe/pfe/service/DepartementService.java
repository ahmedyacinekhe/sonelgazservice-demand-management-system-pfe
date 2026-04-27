package com.pfe.pfe.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pfe.pfe.entity.Departement;
import com.pfe.pfe.repository.DepartementRepository;

@Service
public class DepartementService {

    @Autowired
    private DepartementRepository departementRepository ;

    public List<Departement> findAll(){
        return departementRepository.findAll();
    }

    public Departement findById(int id){
        return departementRepository.findById(id).orElse(null);
    }


    public Departement save(Departement departement){
        return departementRepository.save(departement);
    }
    
    public void deleteById(int Id){
         departementRepository.deleteById(Id);
    }
}

