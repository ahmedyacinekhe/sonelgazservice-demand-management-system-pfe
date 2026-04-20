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

import com.pfe.pfe.entity.Filiale;
import com.pfe.pfe.service.FilialeService;

@RestController
@RequestMapping("Api/filiales")
public class FilialeController {
    @Autowired
    private FilialeService filialeService ;
    @GetMapping
    public List<Filiale> findAll(){
        return filialeService.findAll();
    }
    @GetMapping("/{id}")
    public Filiale findById(@PathVariable int id){
           return filialeService.findById(id);
    }
    @PostMapping
    public Filiale save(@RequestBody Filiale filiale){
        return filialeService.save(filiale);
    } 
    @PutMapping("/{id}")
    public Filiale update(@PathVariable int id , @RequestBody Filiale filiale){
        return filialeService.save(filiale);
    }

    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable int id){
        filialeService.deleteById(id);
    }
    
}
