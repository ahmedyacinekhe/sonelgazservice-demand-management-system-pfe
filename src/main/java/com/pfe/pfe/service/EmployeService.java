package com.pfe.pfe.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pfe.pfe.entity.Employe;
import com.pfe.pfe.repository.EmployeRepository;

@Service
public class EmployeService {
    @Autowired
    private EmployeRepository employeRepository ;


    public List<Employe> findAll(){
        return employeRepository.findAll();
    }

    public Employe findById(int id){
        return employeRepository.findById(id).orElse(null);
    }

    public Employe save(Employe employe){
        return employeRepository.save(employe);
    }


    public void deleteById(int id){
        employeRepository.deleteById(id);
    }

}