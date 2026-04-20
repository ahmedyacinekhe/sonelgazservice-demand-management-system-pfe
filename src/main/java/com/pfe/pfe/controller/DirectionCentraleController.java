package com.pfe.pfe.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pfe.pfe.entity.DirectionCentrale;
import com.pfe.pfe.service.DirectionCentraleService;

@RestController
@RequestMapping("/Api/directionsCentrales")
public class DirectionCentraleController {
     @Autowired
    private DirectionCentraleService directionCentraleService;

    @GetMapping
    public List<DirectionCentrale> findAll(){
        return directionCentraleService.findAll();
    }
    @GetMapping("/{id}")
    public DirectionCentrale findById(@PathVariable int id){
        return directionCentraleService.findById(id);
    }
    @PostMapping
    public DirectionCentrale save(@RequestBody DirectionCentrale directionCentrale){
        return directionCentraleService.save(directionCentrale);
    }
    @PutMapping("/{id}")
    public DirectionCentrale update(@PathVariable int id,@RequestBody DirectionCentrale directionCentrale){
        return directionCentraleService.save(directionCentrale);
    }
    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable int id){
        directionCentraleService.deleteById(id);
    }
    
}


