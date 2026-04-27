package com.pfe.pfe.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
@Entity
@Table(name = "permission")

public class Permission {
    @Id
    @Column(name="id_permission")
    private int idPermission;

     @Column(name="nom_permission")
    private String nomPermission;

    @Column(name="description_permission")
    private String descriptionPermission;
}
