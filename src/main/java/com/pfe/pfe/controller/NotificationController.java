package com.pfe.pfe.controller;
import com.pfe.pfe.entity.Notification;
import com.pfe.pfe.repository.NotificationRepository;
import com.pfe.pfe.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/Api/notifications")
public class NotificationController {

    @Autowired private NotificationRepository notificationRepository;
    @Autowired private JwtUtil jwtUtil;

    private String getEmail(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return jwtUtil.recupererEmail(header.substring(7));
        }
        return null;
    }

    @GetMapping("/mes-notifications")
    public List<Notification> getMesNotifications(HttpServletRequest request) {
        String email = getEmail(request);
        if (email == null) return List.of();
        return notificationRepository
            .findByEmailDestinataireOrderByDateCreationDesc(email);
    }

    @GetMapping("/non-lues")
    public long getNonLues(HttpServletRequest request) {
        String email = getEmail(request);
        if (email == null) return 0;
        return notificationRepository.countByEmailDestinataireAndLuFalse(email);
    }

    @PostMapping
    public Notification create(@RequestBody Notification notification) {
        return notificationRepository.save(notification);
    }

    @PutMapping("/{id}/lu")
    public Notification marquerLu(@PathVariable int id) {
        Notification n = notificationRepository.findById(id).orElseThrow();
        n.setLu(true);
        return notificationRepository.save(n);
    }

    @DeleteMapping("/{id}")
    public void supprimer(@PathVariable int id) {
        notificationRepository.deleteById(id);
    }
}