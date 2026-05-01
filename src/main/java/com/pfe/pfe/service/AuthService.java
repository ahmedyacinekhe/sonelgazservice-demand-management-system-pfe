package com.pfe.pfe.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

import com.pfe.pfe.dto.LoginRequest;
import com.pfe.pfe.dto.LoginResponse;
import com.pfe.pfe.dto.RegisterClientRequest;
import com.pfe.pfe.dto.RegisterEmployeRequest;
import com.pfe.pfe.entity.Client;
import com.pfe.pfe.entity.Departement;
import com.pfe.pfe.entity.Employe;
import com.pfe.pfe.entity.Role;
import com.pfe.pfe.entity.RoleUtilisateur;
import com.pfe.pfe.entity.RoleUtilisateurId;
import com.pfe.pfe.repository.ClientRepository;
import com.pfe.pfe.repository.DepartementRepository;
import com.pfe.pfe.repository.EmployeRepository;
import com.pfe.pfe.repository.RoleRepository;
import com.pfe.pfe.repository.RolePermissionRepository;
import com.pfe.pfe.repository.RoleUtilisateurRepository;
import com.pfe.pfe.repository.UtilisateurRepository;
import com.pfe.pfe.security.JwtUtil;
import jakarta.transaction.Transactional;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UtilisateurRepository utilisateurRepository;
    @Autowired
    private RoleUtilisateurRepository roleUtilisateurRepository;
    @Autowired
    private RolePermissionRepository rolePermissionRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private ClientRepository clientRepository;
    @Autowired
    private EmployeRepository employeRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private DepartementRepository departementRepository;

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String token = jwtUtil.genererToken(request.getEmail());

        var utilisateur = utilisateurRepository.findByEmailUtil(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        List<String> roles = roleUtilisateurRepository
            .findByRoleUtilisateurId_IdUtil(utilisateur.getIdUtil())
            .stream()
            .map(ru -> ru.getRole().getNomRole())
            .collect(java.util.stream.Collectors.toList());

        String role = roles.isEmpty() ? "" : roles.get(0);

        int idRole = roleUtilisateurRepository
            .findByRoleUtilisateurId_IdUtil(utilisateur.getIdUtil())
            .stream()
            .findFirst()
            .map(ru -> ru.getRole().getIdRole())
            .orElse(0);

        List<String> permissions = rolePermissionRepository
            .findByRolePermissionId_IdRole(idRole)
            .stream()
            .map(rp -> rp.getPermission().getNomPermission())
            .collect(java.util.stream.Collectors.toList());

        return new LoginResponse(token, role, permissions);
    }

    @Transactional
    public String registerClient(RegisterClientRequest request) {
        if (utilisateurRepository.findByEmailUtil(request.getEmailUtil()).isPresent()) {
            throw new RuntimeException("Email déja utilisé !");
        }
        Client client = new Client();
        client.setNomUtil(request.getNomUtil());
        client.setPrenomUtil(request.getPrenomUtil());
        client.setNumTel(request.getNumTel());
        client.setEmailUtil(request.getEmailUtil());
        client.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));
        client.setEtatCompte("ACTIF");
        client.setCodePostal(request.getCodePostal());
        client.setAdresseClient(request.getAdresseClient());
        client.setTypeClient(request.getTypeClient());
        Client savedClient = clientRepository.save(client);
        assignRoleToUser(savedClient.getIdUtil(), "CLIENT");
        return "Compte Client crée avec succès !";
    }

    @Transactional
    public String registerEmploye(RegisterEmployeRequest request) {
        if (utilisateurRepository.findByEmailUtil(request.getEmailUtil()).isPresent()) {
            throw new RuntimeException("Email déja utilisée !");
        }
        Employe employe = new Employe();
        employe.setNomUtil(request.getNomUtil());
        employe.setPrenomUtil(request.getPrenomUtil());
        employe.setNumTel(request.getNumTel());
        employe.setEmailUtil(request.getEmailUtil());
        employe.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));
        employe.setEtatCompte("ACTIF");
        employe.setMatricule(request.getMatricule());
        employe.setDateEmbauche(request.getDateEmbauche());
        employe.setAdmin(false);
        Departement departement = departementRepository.findByNomDepartement(request.getNomDepartement())
            .orElseThrow(() -> new RuntimeException("Departement non trouvé !"));
        employe.setDepartement(departement);
        Employe savedEmploye = employeRepository.save(employe);
        assignRoleToUser(savedEmploye.getIdUtil(), "EMPLOYE");
        return "Compte Employe crée avec succès !";
    }

    private void assignRoleToUser(int idUtil, String nomRole) {
        Role role = roleRepository.findByNomRoleIgnoreCase(nomRole)
            .orElseGet(() -> {
                Role newRole = new Role();
                newRole.setNomRole(nomRole.toUpperCase());
                newRole.setDescriptionRole("Role auto-cree pour inscription " + nomRole.toLowerCase());
                return roleRepository.save(newRole);
            });

        RoleUtilisateurId roleUtilisateurId = new RoleUtilisateurId();
        roleUtilisateurId.setIdUtil(idUtil);
        roleUtilisateurId.setIdRole(role.getIdRole());

        if (roleUtilisateurRepository.findById(roleUtilisateurId).isEmpty()) {
            RoleUtilisateur roleUtilisateur = new RoleUtilisateur();
            roleUtilisateur.setRoleUtilisateurId(roleUtilisateurId);
            roleUtilisateurRepository.save(roleUtilisateur);
        }
    }
}