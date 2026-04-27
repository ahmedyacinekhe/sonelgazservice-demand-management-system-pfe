package com.pfe.pfe.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import com.pfe.pfe.entity.RolePermission;
import com.pfe.pfe.entity.RolePermissionId;
import com.pfe.pfe.repository.RolePermissionRepository;

@Service
public class RolePermissionService {

    @Autowired
    private RolePermissionRepository rolePermissionRepository;

    public List<RolePermission> findAll(){
        return rolePermissionRepository.findAll();
    }
    
    public RolePermission findById(RolePermissionId id){
        return rolePermissionRepository.findById(id).orElse(null);
    }

    public RolePermission save(RolePermission rolePermission){
        return rolePermissionRepository.save(rolePermission);
    }

    public void deleteById(RolePermissionId id){
        rolePermissionRepository.deleteById(id);
    }


}
