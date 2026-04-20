package com.pfe.pfe.service;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pfe.pfe.entity.Permission;
import com.pfe.pfe.repository.PermissionRepository;

@Service
public class PermissionService {
    @Autowired
    private PermissionRepository permissionRepository;

    public List<Permission> findAll(){
        return permissionRepository.findAll();
    }

    public Permission findById(int Id){
        return permissionRepository.findById(Id).orElse(null);
    }

    public Permission save (Permission permission ){
        return permissionRepository.save(permission);
    }


    public void deleteById(int Id){
        permissionRepository.deleteById(Id);
    }
    
}
