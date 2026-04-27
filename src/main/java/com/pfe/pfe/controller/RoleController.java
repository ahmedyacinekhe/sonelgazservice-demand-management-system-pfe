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

import com.pfe.pfe.entity.Role;
import com.pfe.pfe.service.RoleService;

@RestController
@RequestMapping("/Api/roles")
public class RoleController {
    
    @Autowired
    private RoleService roleService ;

    @GetMapping
    public List<Role> findAll(){
        return roleService.findAll();
    }

    @GetMapping("/{id}")
    public Role findById(@PathVariable int id ){
        return roleService.findById(id);
    }

    @PostMapping
    public Role save(@RequestBody Role role){
        return roleService.save(role);
    }
    @PutMapping("/{id}")
    public Role update(@PathVariable int id, @RequestBody Role role){
        return roleService.save(role);
    }
    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable int id){
        roleService.deleteById(id);
    }
}


