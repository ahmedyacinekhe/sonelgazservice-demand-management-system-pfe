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

import com.pfe.pfe.entity.Employe;
import com.pfe.pfe.service.EmployeService;

@RestController
@RequestMapping("Api/employes")
public class EmployeController {
    @Autowired
    private EmployeService employeService;

    @GetMapping
    public List<Employe> findAll(){
        return employeService.findAll();
    }

    @GetMapping("/{id}")
    public Employe findById(@PathVariable int id ){
        return employeService.findById(id);
    }

    @PostMapping
    public Employe save(@RequestBody Employe employe){  
         return employeService.save(employe);
       }
    @PutMapping("/{id}")
    public Employe  update(@PathVariable int id , @RequestBody Employe employe){
        return employeService.save(employe);
    }

    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable int id){
        employeService.deleteById(id);
    }
}
