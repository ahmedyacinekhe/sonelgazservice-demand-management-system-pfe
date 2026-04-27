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

import com.pfe.pfe.entity.Departement;
import com.pfe.pfe.service.DepartementService;

@RestController
@RequestMapping("/Api/departements")
public class DepartementController {
    @Autowired
    private DepartementService departementService;

    @GetMapping
    public List<Departement> findAll(){
        return departementService.findAll();
    }
    @GetMapping("/{id}")
    public Departement findById(@PathVariable int id){
        return departementService.findById(id);
    }
    @PostMapping
    public Departement save(@RequestBody Departement departement){
        return departementService.save(departement);
    }
    @PutMapping("/{id}")
    public Departement update(@PathVariable int id, @RequestBody Departement departement){
        return departementService.save(departement);
    }
    @DeleteMapping("/{id}")
     public void deleteById(@PathVariable int id){
        departementService.deleteById(id);
     } 
    
}
