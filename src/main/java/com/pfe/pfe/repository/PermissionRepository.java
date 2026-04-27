package com.pfe.pfe.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pfe.pfe.entity.Permission;
@Repository

public interface PermissionRepository extends JpaRepository<Permission , Integer> {
    
}
