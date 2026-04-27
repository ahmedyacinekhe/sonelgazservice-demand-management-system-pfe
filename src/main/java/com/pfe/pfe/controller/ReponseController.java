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

import com.pfe.pfe.entity.Reponse;
import com.pfe.pfe.service.ReponseService;

@RestController
@RequestMapping("/Api/reponses")
public class ReponseController {
    



public class RequeteController {

     @Autowired
    private ReponseService reponseService;

    @GetMapping
    public List<Reponse> findAll(){
        return reponseService.findAll();
    }
    @GetMapping("/{id}")
    public Reponse findById(@PathVariable int id){
        return reponseService.findById(id);
    }
    @PostMapping
    public Reponse save(@RequestBody Reponse reponse){
        return reponseService.save(reponse);
    }
    @PutMapping("/{id}")
    public Reponse update(@PathVariable int id,@RequestBody Reponse reponse){
        return reponseService.save(reponse);
    }
    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable int id){
        reponseService.deleteById(id);
    }
    
}


}
