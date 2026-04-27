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

import com.pfe.pfe.entity.Demande;
import com.pfe.pfe.service.DemandeService;

@RestController
@RequestMapping("/Api/demandes")
public class DemandeController {
    @Autowired
    private DemandeService demandeService;
    @GetMapping
    public List<Demande> findAll(){
        return demandeService.findAll();
    }
    @GetMapping("/{id}")
    public Demande findById(@PathVariable int id){
        return demandeService.findById(id);
    }
    @PostMapping
    public Demande save(@RequestBody Demande demande){
        return demandeService.save(demande);
    }
    @PutMapping("/{id}")
    public Demande update(@PathVariable int id,@RequestBody Demande demande){
        return demandeService.save(demande);
    }
    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable int id){
        demandeService.deleteById(id);
    }
    
    
}
