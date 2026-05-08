package com.pfe.pfe.security;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.pfe.pfe.entity.Employe;
import com.pfe.pfe.entity.RoleUtilisateur;
import com.pfe.pfe.entity.Utilisateur;
import com.pfe.pfe.repository.RoleUtilisateurRepository;
import com.pfe.pfe.repository.UtilisateurRepository;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private RoleUtilisateurRepository roleUtilisateurRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        System.out.println("🔍 loadUserByUsername appelé pour: " + email);

        Utilisateur utilisateur = utilisateurRepository.findByEmailUtil(email).orElseThrow(
            () -> new UsernameNotFoundException("email nest pas trouve: " + email)
        );

        System.out.println("✅ Utilisateur trouvé: " + utilisateur.getEmailUtil() + " etat: " + utilisateur.getEtatCompte());

        List<GrantedAuthority> authorities = new ArrayList<>();
        if (utilisateur instanceof Employe employe) {
            List<RoleUtilisateur> rolesUtilisateur = roleUtilisateurRepository.findByRoleUtilisateurId_IdUtil(employe.getIdUtil());
            System.out.println("🎭 Roles trouvés: " + rolesUtilisateur.size());
            for (RoleUtilisateur roleUtilisateur : rolesUtilisateur) {
                authorities.add(new SimpleGrantedAuthority("ROLE_" + roleUtilisateur.getRole().getNomRole()));
                System.out.println("➕ Role ajouté: ROLE_" + roleUtilisateur.getRole().getNomRole());
            }
            if (employe.isAdmin()) {
                authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
            }
        } else {
            authorities.add(new SimpleGrantedAuthority("ROLE_CLIENT"));
        }

        boolean enabled = utilisateur.getEtatCompte().equals("ACTIF");
        System.out.println("🔐 enabled=" + enabled + " authorities=" + authorities);

        return new User(utilisateur.getEmailUtil(), utilisateur.getMotDePasse(), enabled, true, true, true, authorities);
    }
}