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

import com.pfe.pfe.entity.Metier;
import com.pfe.pfe.service.MetierService;

@RestController
@RequestMapping("/Api/metier")
public class MetierController {
    @Autowired
    private MetierService metierService;

    @GetMapping
    public List<Metier> findAll(){
        return metierService.findAll();
    }
    @GetMapping("/{id}")
    public Metier findById(@PathVariable int id){
        return metierService.findById(id);
    }
    @PostMapping
    public Metier save(@RequestBody Metier metier){
        return metierService.save(metier);
    }

    @PutMapping("/{id}")
    public Metier update(@PathVariable int id, @RequestBody Metier metier){
        return metierService.save(metier);
    }
    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable int id){
        metierService.deleteById(id);
    }
}
