package com.pfe.pfe.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
@Getter
@Setter
@Embeddable

public class RolePermissionId implements Serializable{
    @Column(name="id_role")
    private int idRole;

     @Column(name="id_permission")
    private int idPermission;
}
