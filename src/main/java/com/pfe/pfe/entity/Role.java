package com.pfe.pfe.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
@Entity
@Table(name = "role")

public class Role {
    @Id
    @Column(name="id_role")
    private int idRole;

    @Column(name="nom_role")
    private String nomRole;

    @Column(name="description_role")
    private String descriptionRole;

}
