package com.pfe.pfe.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Embeddable
@Getter
@Setter

public class RoleUtilisateurId implements Serializable{
    @Column(name="id_util")
    private int idUtil;

    @Column(name="id_role")
    private int idRole;


}
