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

import com.pfe.pfe.entity.Requete;
import com.pfe.pfe.service.RequeteService;

@RestController
@RequestMapping("/Api/requetes")
public class RequeteController {

     @Autowired
    private RequeteService requeteService;

    @GetMapping
    public List<Requete> findAll(){
        return requeteService.findAll();
    }
    @GetMapping("/{id}")
    public Requete findById(@PathVariable int id){
        return requeteService.findById(id);
    }
    @PostMapping
    public Requete save(@RequestBody Requete requete){
        return requeteService.save(requete);
    }
    @PutMapping("/{id}")
    public Requete update(@PathVariable int id,@RequestBody Requete requete){
        return requeteService.save(requete);
    }
    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable int id){
        requeteService.deleteById(id);
    }
    
}

