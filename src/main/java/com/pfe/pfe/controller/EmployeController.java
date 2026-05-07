package com.pfe.pfe.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.pfe.pfe.entity.Employe;
import com.pfe.pfe.repository.EmployeRepository;
import com.pfe.pfe.service.EmployeService;

@RestController
@RequestMapping("Api/employes")
public class EmployeController {

    @Autowired
    private EmployeService employeService;

    @Autowired
    private EmployeRepository employeRepository;

    @GetMapping
    public List<Employe> findAll() {
        return employeService.findAll();
    }

    @GetMapping("/departement/{idDepartement}")
    public List<Employe> findByDepartement(@PathVariable int idDepartement) {
        return employeService.findByDepartement(idDepartement);
    }

    @GetMapping("/me/departement")
    public ResponseEntity<?> getMonDepartement(@AuthenticationPrincipal UserDetails userDetails) {
        Employe emp = employeRepository.findByEmailUtil(userDetails.getUsername()).orElse(null);
        if (emp == null || emp.getDepartement() == null) return ResponseEntity.ok(null);
        return ResponseEntity.ok(emp.getDepartement());
    }

    @PutMapping("/{id}/departement/{idDepartement}")
    public void changerDepartement(@PathVariable int id, @PathVariable int idDepartement) {
        employeService.changerDepartement(id, idDepartement);
    }

    @GetMapping("/{id}")
    public Employe findById(@PathVariable int id) {
        return employeService.findById(id);
    }

    @PostMapping
    public Employe save(@RequestBody Employe employe) {
        return employeService.save(employe);
    }

    @PutMapping("/{id}")
    public Employe update(@PathVariable int id, @RequestBody Employe employe) {
        return employeService.save(employe);
    }

    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable int id) {
        employeService.deleteById(id);
    }
}