package com.bookies;

import java.util.Optional;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.bookies.model.User;
import com.bookies.repository.UserRepository;

@SpringBootApplication
public class BookiesBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BookiesBackendApplication.class, args);
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	// Seed a default admin user on startup for local development
	@Bean
	@Profile("!test")
	public CommandLineRunner seedAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			String adminEmail = "librarian@library.com";
			Optional<User> existing = userRepository.findByEmail(adminEmail);
			if (existing.isEmpty()) {
				User admin = new User();
				admin.setName("Librarian");
				admin.setEmail(adminEmail);
				admin.setRole("ADMIN");
				// default password is 1234
				admin.setPassword(passwordEncoder.encode("1234"));
				userRepository.save(admin);
				System.out.println("Seeded default admin user: " + adminEmail + " (password: 1234)");
			}
		};
	}

	// Add this CORS configuration method
	@Bean
	public WebMvcConfigurer corsConfigurer() {
		return new WebMvcConfigurer() {
			@Override
			public void addCorsMappings(CorsRegistry registry) {
				registry.addMapping("/api/**")
						.allowedOrigins("http://localhost:5173", "http://localhost:3000", "http://localhost:8080")
						.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
						.allowedHeaders("*")
						.allowCredentials(true);
			}
		};
	}
}