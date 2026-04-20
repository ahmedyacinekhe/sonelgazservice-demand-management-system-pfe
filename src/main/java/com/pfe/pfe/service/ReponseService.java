package com.pfe.pfe.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pfe.pfe.entity.Reponse;
import com.pfe.pfe.repository.ReponseRepository;

@Service
public class ReponseService {

    @Autowired
    private ReponseRepository reponseRepository ;

    public List<Reponse>findAll(){
        return reponseRepository.findAll();
    }

    public Reponse findById(int Id){
        return reponseRepository.findById(Id).orElse(null);
    }

    public Reponse save(Reponse reponse){
         return reponseRepository.save(reponse);
    }

     public void deleteById(int Id ){
        reponseRepository.deleteById(Id);
     }
    
}
