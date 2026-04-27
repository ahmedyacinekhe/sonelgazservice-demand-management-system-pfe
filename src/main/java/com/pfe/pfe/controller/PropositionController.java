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

import com.pfe.pfe.entity.Proposition;
import com.pfe.pfe.service.PropositionService;
@RestController
@RequestMapping("/Api/propositions")
public class PropositionController {
    @Autowired
    private PropositionService propositionService;

    @GetMapping
    public List<Proposition> findAll(){
        return propositionService.findAll();

    }
    @GetMapping("/{id}")
    public Proposition findById(@PathVariable int id){
        return propositionService.findById(id);
    }
    @PostMapping
    public Proposition save(@RequestBody Proposition proposition){
        return propositionService.save(proposition);
    }
    @PutMapping("/{id}")
    public Proposition update(@PathVariable int id, @RequestBody Proposition proposition){
        return propositionService.save(proposition);
    }
    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable int id){
        propositionService.deleteById(id);
    }
    
}
