package com.assettracker.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

/**
 * Global CORS configuration — allows the React dev server (port 5173 / 3000)
 * to call the Spring Boot API (port 8080) without browser CORS errors.
 *
 * For production, replace the allowed origins with your actual frontend domain.
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // --- Allowed origins ---
        // Add your production frontend URL here when deploying
        config.setAllowedOrigins(List.of(
            "http://localhost:5173",   // Vite dev server
            "http://localhost:3000"    // CRA dev server (fallback)
        ));

        // --- Allowed HTTP methods ---
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // --- Allowed request headers ---
        config.setAllowedHeaders(List.of("*"));

        // --- Allow cookies / auth headers if needed in future ---
        config.setAllowCredentials(true);

        // --- Cache pre-flight response for 1 hour ---
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);

        return new CorsFilter(source);
    }
}
