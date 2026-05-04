package com.pfe.pfe.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "role_permission")
@Getter
@Setter
public class RolePermission {

    @EmbeddedId
    private RolePermissionId rolePermissionId;

    @ManyToOne
    @JoinColumn(name="id_role", insertable=false, updatable=false)
    @JsonIgnoreProperties({"rolePermissions", "utilisateurs"})
    private Role role;

    @ManyToOne
    @JoinColumn(name="id_permission", insertable=false, updatable=false)
    @JsonIgnoreProperties({"rolePermissions"})
    private Permission permission;
}