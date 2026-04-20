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

import com.pfe.pfe.entity.Reclamation;
import com.pfe.pfe.service.ReclamationService;

@RestController
@RequestMapping("/Api/reclamations")
public class ReclamationController {
    @Autowired
    private ReclamationService reclamationService;

    @GetMapping
    public List<Reclamation> findAll(){
        return reclamationService.findAll();
    }
    @GetMapping("/{id}")
    public Reclamation findById(@PathVariable int id){
        return reclamationService.findById(id);
    }

    @PostMapping
    public Reclamation save(@RequestBody Reclamation reclamation){
        return reclamationService.save(reclamation);
    }
    @PutMapping("/{id}")
    public Reclamation update(@PathVariable int id ,@RequestBody Reclamation reclamation){
        return reclamationService.save(reclamation);
    }
    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable int id){
        reclamationService.deleteById(id);
    }
    
}
