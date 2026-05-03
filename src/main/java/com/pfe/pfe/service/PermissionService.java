package com.pfe.pfe.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

import com.pfe.pfe.entity.Permission;
import com.pfe.pfe.repository.PermissionRepository;

@Service
public class PermissionService {

    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private jakarta.persistence.EntityManager entityManager;

    public List<Permission> findAll() {
        return permissionRepository.findAll();
    }

    public Permission findById(int id) {
        return permissionRepository.findById(id).orElse(null);
    }

    public Permission save(Permission permission) {
        return permissionRepository.save(permission);
    }

    @Transactional
    public void deleteById(int id) {
        entityManager.createNativeQuery("DELETE FROM role_permission WHERE id_permission = :id")
            .setParameter("id", id)
            .executeUpdate();

        entityManager.createNativeQuery("DELETE FROM permission WHERE id_permission = :id")
            .setParameter("id", id)
            .executeUpdate();
    }
}