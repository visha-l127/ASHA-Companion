package com.ashacompanion.pharmacy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@ComponentScan(basePackages = "com.ashacompanion")
@EntityScan(basePackages = "com.ashacompanion.entity")
@EnableJpaRepositories(basePackages = "com.ashacompanion.repository")
public class PharmacyServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(PharmacyServiceApplication.class, args);
    }
}
