package com.pfe.pfe.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pfe.pfe.entity.Role;
import com.pfe.pfe.repository.RoleRepository;


@Service
public class RoleService {

    @Autowired
    private RoleRepository roleRepository;
   
    
    public List<Role> findAll(){
        return roleRepository.findAll();
    }


    public Role findById(int id){
        return roleRepository.findById(id).orElse(null);

    }
    
    public Role save(Role role){
        return roleRepository.save(role);
    }

    public void deleteById(int id){
        roleRepository.deleteById(id);
    }
}




    

