package com.pfe.pfe.service;



import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pfe.pfe.entity.Direction;
import com.pfe.pfe.repository.DirectionRepository;

@Service
public class DirectionService {

    @Autowired
    private DirectionRepository directionRepository ;

    public List<Direction> findAll(){
        return directionRepository.findAll();
    }
    
    public Direction findById(int id ){
        return directionRepository.findById(id).orElse(null);
    }

    public Direction save(Direction direction){
        return directionRepository.save(direction);
    }


    public void deleteById(int id){
        directionRepository.deleteById(id);
 }
}
