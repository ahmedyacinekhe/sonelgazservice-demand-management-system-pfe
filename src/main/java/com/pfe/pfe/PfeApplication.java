package com.pfe.pfe;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan(basePackages = "com.pfe.pfe.entity")
@EnableJpaRepositories(basePackages = "com.pfe.pfe.repository")
public class PfeApplication {
    public static void main(String[] args) {
        SpringApplication.run(PfeApplication.class, args);
    }
}