package com.pfe.pfe.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pfe.pfe.entity.RolePermission;
import com.pfe.pfe.entity.RolePermissionId;

@Repository

public interface RolePermissionRepository extends JpaRepository<RolePermission,RolePermissionId>{
    
}
