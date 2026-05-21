package com.pfe.pfe.repository;

import com.pfe.pfe.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByEmailDestinataireOrderByDateCreationDesc(String email);
    long countByEmailDestinataireAndLuFalse(String email);
}