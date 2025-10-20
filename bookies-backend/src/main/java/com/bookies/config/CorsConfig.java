package com.bookies.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow credentials (for Authorization header)
        config.setAllowCredentials(true);
        
        // Allow frontend origins (localhost for development + Vercel for production)
        config.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:*",                    // All localhost ports
            "https://*.vercel.app",                  // All Vercel deployments
            "https://free-shelf-buddy-37.vercel.app" // Your specific Vercel domain
        ));
        
        // Allow all headers
        config.addAllowedHeader("*");
        
        // Allow all HTTP methods
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        
        // Expose Authorization header
        config.setExposedHeaders(Arrays.asList("Authorization"));
        
        // Cache preflight response for 1 hour
        config.setMaxAge(3600L);
        
        // Apply CORS configuration to all endpoints
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}
