package com.pfe.pfe.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pfe.pfe.entity.DirectionCentrale;
import com.pfe.pfe.repository.DirectionCentraleRepository;

@Service
public class DirectionCentraleService {

    @Autowired
    private DirectionCentraleRepository directionCentraleRepository;

    public List<DirectionCentrale> findAll(){
        return directionCentraleRepository.findAll();
    }

    public DirectionCentrale findById(int id){
        return directionCentraleRepository.findById(id).orElse(null);
    }

    public DirectionCentrale save(DirectionCentrale directionCentrale){
        return directionCentraleRepository.save(directionCentrale);
    }

    public void deleteById(int id){
        directionCentraleRepository.deleteById(id);
    }
}
