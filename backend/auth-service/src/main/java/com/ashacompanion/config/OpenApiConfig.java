package com.ashacompanion.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        return new OpenAPI()
                .servers(List.of(
                        new Server().url("/").description("Current Server / API Gateway (Relative)"),
                        new Server().url("http://localhost:8081").description("API Gateway (localhost:8081)"),
                        new Server().url("http://localhost:8082").description("Auth Service Direct (localhost:8082)")
                ))
                .info(new Info()
                        .title("ASHA Companion Backend API")
                        .version("1.0.0")
                        .description("Comprehensive Healthcare Microservices Backend API for ASHA Workers, PHC Supervisors, Pharmacists, and System Admins.")
                        .contact(new Contact()
                                .name("ASHA Companion Development Team")
                                .email("support@ashacompanion.org")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter your JWT token obtained from POST /auth/login")));
    }
}
