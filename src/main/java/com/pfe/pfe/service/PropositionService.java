package com.pfe.pfe.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pfe.pfe.entity.Proposition;
import com.pfe.pfe.repository.PropositionRepository;

@Service
public class PropositionService {

    @Autowired
    private PropositionRepository propositionRepository ;

    public List<Proposition> findAll(){
        return propositionRepository.findAll();
    }

    public Proposition findById(int id){
        return propositionRepository.findById(id).orElse(null);
    }

    public Proposition save(Proposition proposition){
        return propositionRepository.save(proposition);
    }


    public void deleteById(int id){
        propositionRepository.deleteById(id);
    }
}
