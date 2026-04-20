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

import com.pfe.pfe.entity.Permission;
import com.pfe.pfe.service.PermissionService;

@RestController
@RequestMapping("/Api/permissions")
public class PermissionController {
    @Autowired
    private PermissionService permissionService ;

    @GetMapping
    public List<Permission> findAll(){
        return permissionService.findAll();
    }

    @GetMapping("/{id}")
    public Permission findById(@PathVariable int id ){
        return permissionService.findById(id);
    }

    @PostMapping
    public Permission save(@RequestBody Permission permission){
        return permissionService.save(permission);
    }
    @PutMapping("/{id}")
    public Permission update(@PathVariable int id, @RequestBody Permission permission){
        return permissionService.save(permission);
    }
    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable int id){
        permissionService.deleteById(id);
    }
}
