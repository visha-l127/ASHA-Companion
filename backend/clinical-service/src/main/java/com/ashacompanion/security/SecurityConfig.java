package com.ashacompanion.security;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
        configuration.setAllowedOriginPatterns(java.util.List.of("*"));
        configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(java.util.List.of("*"));
        configuration.setAllowCredentials(true);
        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/register", "/auth/login").permitAll()
                .requestMatchers("/auth/change-password").hasAnyRole("ADMIN", "PHC_SUPERVISOR", "ASHA", "PHARMACIST")
                .requestMatchers("/health", "/actuator/health", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                .requestMatchers("/internal/**").permitAll()
                .requestMatchers("/auth/test/admin").hasRole("ADMIN")
                .requestMatchers("/auth/test/supervisor").hasRole("PHC_SUPERVISOR")
                .requestMatchers("/auth/test/asha").hasRole("ASHA")
                .requestMatchers("/auth/test/pharmacist").hasRole("PHARMACIST")
                
                // PHC management endpoints
                .requestMatchers(HttpMethod.POST, "/phcs").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/phcs/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/phcs/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/phcs/**").hasAnyRole("ADMIN", "PHC_SUPERVISOR")
                
                // User profile endpoint
                .requestMatchers(HttpMethod.GET, "/users/profile").hasAnyRole("ADMIN", "PHC_SUPERVISOR", "ASHA", "PHARMACIST")

                // User management endpoints
                .requestMatchers("/users", "/users/**").hasAnyRole("ADMIN", "PHC_SUPERVISOR")
                
                // Patient management endpoints
                .requestMatchers("/patients/**").hasAnyRole("ADMIN", "PHC_SUPERVISOR", "ASHA")
                
                // Households endpoints
                .requestMatchers("/households/**").hasAnyRole("ADMIN", "PHC_SUPERVISOR", "ASHA")

                // Medicine issues endpoints
                .requestMatchers("/medicine-issues/**").hasAnyRole("ADMIN", "PHC_SUPERVISOR", "ASHA")
                
                // Maternal Health domain endpoints
                .requestMatchers("/pregnancies/**").hasAnyRole("ADMIN", "PHC_SUPERVISOR", "ASHA")
                .requestMatchers("/antenatal-visits/**").hasAnyRole("ADMIN", "PHC_SUPERVISOR", "ASHA")
                
                // Immunization domain endpoints
                .requestMatchers(HttpMethod.POST, "/vaccines").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/vaccines/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/vaccines/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/vaccines/**").hasAnyRole("ADMIN", "PHC_SUPERVISOR", "ASHA", "PHARMACIST")
                .requestMatchers("/immunizations/**").hasAnyRole("ADMIN", "PHC_SUPERVISOR", "ASHA")
                
                // Nutrition domain endpoints
                .requestMatchers("/nutrition-records/**").hasAnyRole("ADMIN", "PHC_SUPERVISOR", "ASHA")
                .requestMatchers("/patients/*/nutrition-records/**").hasAnyRole("ADMIN", "PHC_SUPERVISOR", "ASHA")
                
                // Pharmacy management endpoints
                .requestMatchers(HttpMethod.POST, "/medicines").hasAnyRole("ADMIN", "PHARMACIST")
                .requestMatchers(HttpMethod.PUT, "/medicines/**").hasAnyRole("ADMIN", "PHARMACIST")
                .requestMatchers(HttpMethod.DELETE, "/medicines/**").hasAnyRole("ADMIN", "PHARMACIST")
                .requestMatchers(HttpMethod.GET, "/medicines", "/medicines/**").hasAnyRole("ADMIN", "PHC_SUPERVISOR", "PHARMACIST")

                .requestMatchers(HttpMethod.POST, "/medicine-batches").hasAnyRole("ADMIN", "PHARMACIST")
                .requestMatchers(HttpMethod.PUT, "/medicine-batches/**").hasAnyRole("ADMIN", "PHARMACIST")
                .requestMatchers(HttpMethod.DELETE, "/medicine-batches/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/medicine-batches/**").hasAnyRole("ADMIN", "PHC_SUPERVISOR", "PHARMACIST")

                .requestMatchers(HttpMethod.POST, "/medicine-transactions/**").hasAnyRole("ADMIN", "PHARMACIST")
                .requestMatchers(HttpMethod.GET, "/medicine-transactions/**").hasAnyRole("ADMIN", "PHC_SUPERVISOR", "PHARMACIST")

                .requestMatchers(HttpMethod.GET, "/medicine-stock/**").hasAnyRole("ADMIN", "PHC_SUPERVISOR", "PHARMACIST")
                
                // Dashboard endpoints
                .requestMatchers("/dashboard/summary").hasAnyRole("ADMIN", "PHC_SUPERVISOR", "ASHA", "PHARMACIST")
                .requestMatchers("/dashboard/asha/**").hasRole("ASHA")
                .requestMatchers("/dashboard/supervisor/**").hasRole("PHC_SUPERVISOR")
                .requestMatchers("/dashboard/admin/**").hasRole("ADMIN")
                .requestMatchers("/dashboard/patients/*/summary").hasAnyRole("ADMIN", "PHC_SUPERVISOR", "ASHA")
                .requestMatchers("/dashboard/**").hasAnyRole("ADMIN", "PHC_SUPERVISOR", "ASHA", "PHARMACIST")

                // Reports endpoints
                .requestMatchers("/reports/medicines").hasAnyRole("ADMIN", "PHC_SUPERVISOR", "PHARMACIST")
                .requestMatchers("/reports/patients", "/reports/maternal", "/reports/immunization", "/reports/nutrition").hasAnyRole("ADMIN", "PHC_SUPERVISOR", "ASHA")
                .requestMatchers("/reports", "/reports/**").hasAnyRole("ADMIN", "PHC_SUPERVISOR", "ASHA", "PHARMACIST")
                
                // Alert endpoints
                .requestMatchers("/alerts", "/alerts/**").hasAnyRole("ADMIN", "PHC_SUPERVISOR", "ASHA", "PHARMACIST")

                // Offline Sync endpoints
                .requestMatchers("/sync", "/sync/**").hasAnyRole("ADMIN", "PHC_SUPERVISOR", "ASHA", "PHARMACIST")

                // Priority Visits endpoints
                .requestMatchers("/priority-visits", "/priority-visits/**").hasAnyRole("ADMIN", "PHC_SUPERVISOR", "ASHA", "PHARMACIST")
                
                // EHR Records endpoints
                .requestMatchers("/ehr-records", "/ehr-records/**").hasAnyRole("ADMIN", "PHC_SUPERVISOR", "ASHA", "PHARMACIST")

                // Phase 11 Risk, Alert & Forecast endpoints
                .requestMatchers("/health-risks", "/health-risks/**").hasAnyRole("ADMIN", "PHC_SUPERVISOR", "ASHA")
                .requestMatchers("/health-alerts", "/health-alerts/**").hasAnyRole("ADMIN", "PHC_SUPERVISOR", "ASHA", "PHARMACIST")
                .requestMatchers("/medicine-forecasts", "/medicine-forecasts/**").hasAnyRole("ADMIN", "PHC_SUPERVISOR", "PHARMACIST")

                // Phase 12 Audit Log endpoints
                .requestMatchers("/audit-logs", "/audit-logs/**").hasAnyRole("ADMIN", "PHC_SUPERVISOR", "ASHA", "PHARMACIST")

                // AI Module endpoints
                .requestMatchers("/ai/maternal/**", "/ai/immunization/**", "/ai/nutrition/**", "/ai/patient/**").hasAnyRole("ADMIN", "PHC_SUPERVISOR", "ASHA")
                .requestMatchers("/ai/medicine/**").hasAnyRole("ADMIN", "PHC_SUPERVISOR", "PHARMACIST")
                .requestMatchers("/ai/dashboard/summary").hasAnyRole("ADMIN", "PHC_SUPERVISOR", "ASHA", "PHARMACIST")
                .requestMatchers("/ai", "/ai/**").hasAnyRole("ADMIN", "PHC_SUPERVISOR", "ASHA", "PHARMACIST")

                .anyRequest().authenticated()
            )
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setContentType("application/json");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("{\"status\":401,\"message\":\"Authentication required\"}");
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setContentType("application/json");
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.getWriter().write("{\"status\":403,\"message\":\"Access denied\"}");
                })
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
