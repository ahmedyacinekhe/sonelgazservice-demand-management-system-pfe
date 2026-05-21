package com.pfe.pfe.service;

import com.pfe.pfe.entity.Employe;
import com.pfe.pfe.entity.Notification;
import com.pfe.pfe.repository.EmployeRepository;
import com.pfe.pfe.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificationService {

    @Autowired private NotificationRepository notificationRepository;
    @Autowired private EmployeRepository employeRepository;

    // Envoyer une notification à un utilisateur
    public void envoyer(String emailDestinataire, String message, String type) {
        Notification n = new Notification();
        n.setEmailDestinataire(emailDestinataire);
        n.setMessage(message);
        n.setType(type);
        notificationRepository.save(n);
    }

    // Envoyer une notification à tous les responsables d'un département
    public void notifierResponsables(int idDepartement, String message, String type) {
        List<Employe> responsables = employeRepository.findResponsablesByDepartement(idDepartement);
        for (Employe r : responsables) {
            envoyer(r.getEmailUtil(), message, type);
        }
    }
}