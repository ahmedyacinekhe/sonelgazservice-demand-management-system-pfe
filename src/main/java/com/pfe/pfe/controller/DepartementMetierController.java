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

import com.pfe.pfe.entity.DepartementMetier;
import com.pfe.pfe.entity.DepartementMetierId;
import com.pfe.pfe.service.DepartementMetierService;
@RequestMapping("/Api/departementMetier")
@RestController
public class DepartementMetierController {
    @Autowired
    private  DepartementMetierService departementMetierService ;
    @GetMapping
    public List<DepartementMetier> findAll(){
        return departementMetierService.findAll();
    }
    @GetMapping("/{id}")
    public DepartementMetier findById(@PathVariable DepartementMetierId id){
        return departementMetierService.findById(id);
    } 
    @PostMapping
    public DepartementMetier save(@RequestBody DepartementMetier departementMetier){
        return departementMetierService.save(departementMetier);
    }
    @PutMapping("/{id}")
    public DepartementMetier update(@PathVariable DepartementMetierId id,@RequestBody DepartementMetier departementMetier){
        return departementMetierService.save(departementMetier);
    }
    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable DepartementMetierId id){
        departementMetierService.deleteById(id);
    }
    
}
