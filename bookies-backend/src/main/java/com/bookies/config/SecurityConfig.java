package com.bookies.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.bookies.security.JwtAuthenticationFilter;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configure(http)) // Enable CORS
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/users/signup").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/users/login").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/books/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/books/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/books/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/books/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/users/change-password").authenticated()
                // Book request endpoints
                .requestMatchers(HttpMethod.POST, "/api/book-requests").authenticated() // Users can create requests
                .requestMatchers(HttpMethod.GET, "/api/book-requests/user/**").authenticated() // Users can view their own requests
                .requestMatchers(HttpMethod.GET, "/api/book-requests/**").hasAuthority("ROLE_ADMIN") // Admin can view all
                .requestMatchers(HttpMethod.POST, "/api/book-requests/*/approve").hasAuthority("ROLE_ADMIN") // Admin only
                .requestMatchers(HttpMethod.POST, "/api/book-requests/*/reject").hasAuthority("ROLE_ADMIN") // Admin only
                .requestMatchers(HttpMethod.DELETE, "/api/book-requests/**").hasAuthority("ROLE_ADMIN") // Admin only
                .anyRequest().permitAll()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(new JwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
