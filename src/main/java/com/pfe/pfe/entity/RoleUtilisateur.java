package com.pfe.pfe.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
@Entity
@Table(name = "role_utilisateur")

public class RoleUtilisateur {
    
    @EmbeddedId
    private RoleUtilisateurId roleUtilisateurId;

    @ManyToOne
    @JoinColumn(name="id_util", insertable=false, updatable=false)
    private Utilisateur utilisateur;

    @ManyToOne
    @JoinColumn(name="id_role", insertable=false, updatable=false)
    private Role role;
}
