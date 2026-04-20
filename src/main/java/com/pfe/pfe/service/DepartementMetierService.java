package com.pfe.pfe.service;

import java.util.List;

import com.pfe.pfe.repository.DepartementMetierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pfe.pfe.entity.DepartementMetier;
import com.pfe.pfe.entity.DepartementMetierId;

@Service
public class DepartementMetierService {

    @Autowired
    private DepartementMetierRepository departementMetierRepository ;

    public List<DepartementMetier> findAll(){
        return departementMetierRepository.findAll();
    }

    public DepartementMetier findById(DepartementMetierId id){
        return departementMetierRepository.findById(id).orElse(null);
    }

    public DepartementMetier save(DepartementMetier departementMetier){
        return departementMetierRepository.save(departementMetier);
    }

    public void deleteById(DepartementMetierId id){
        departementMetierRepository.deleteById(id);
    }



}
