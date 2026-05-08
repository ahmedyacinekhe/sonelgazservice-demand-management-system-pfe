package com.pfe.pfe.repository;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.pfe.pfe.entity.Client;

@Repository
public interface ClientRepository extends JpaRepository<Client, Integer> {
    Optional<Client> findByEmailUtil(String emailUtil);
}