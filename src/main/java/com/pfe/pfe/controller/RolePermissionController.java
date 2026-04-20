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

import com.pfe.pfe.entity.RolePermission;
import com.pfe.pfe.entity.RolePermissionId;
import com.pfe.pfe.service.RolePermissionService;

@RestController
@RequestMapping("/Api/rolePermissions")
public class RolePermissionController {
    @Autowired
    private RolePermissionService rolePermissionService;

    @GetMapping
    public List<RolePermission> findAll(){
        return rolePermissionService.findAll();
    }
    @GetMapping("/{id}")
    public RolePermission findById(@PathVariable RolePermissionId id){
        return rolePermissionService.findById(id);
    } 
   @PostMapping
   public RolePermission save(@RequestBody RolePermission rolePermission){
    return rolePermissionService.save(rolePermission);
   }
    @PutMapping("/{id}")
    public RolePermission update(@PathVariable RolePermissionId id, @RequestBody RolePermission rolePermission){
        return rolePermissionService.save(rolePermission);

    }
    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable RolePermissionId id){
        rolePermissionService.deleteById(id);
    }
    
}
