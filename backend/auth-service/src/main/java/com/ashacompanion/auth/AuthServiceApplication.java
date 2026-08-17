package com.ashacompanion.auth;

import com.ashacompanion.entity.User;
import com.ashacompanion.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication(scanBasePackages = "com.ashacompanion")
@EntityScan(basePackages = "com.ashacompanion.entity")
@EnableJpaRepositories(basePackages = "com.ashacompanion.repository")
public class AuthServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }

    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository,
                                           BCryptPasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepository.existsByUsername("admin")) {
                User admin = new User(
                        "Administrator",
                        "admin",
                        passwordEncoder.encode("Admin@123"),
                        "ADMIN",
                        null
                );
                userRepository.save(admin);
                System.out.println("Default admin user created successfully.");
            }
        };
    }
}
