package com.bookies.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.bookies.model.User;
import com.bookies.repository.UserRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Create admin user if it doesn't exist
        if (!userRepository.findByEmail("admin@bookies.com").isPresent()) {
            User admin = new User();
            admin.setName("Admin");
            admin.setEmail("admin@bookies.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("ADMIN");
            userRepository.save(admin);
            System.out.println("Created default admin user: admin@bookies.com / admin123");
        }

        // Create regular user if it doesn't exist
        if (!userRepository.findByEmail("user@bookies.com").isPresent()) {
            User user = new User();
            user.setName("User");
            user.setEmail("user@bookies.com");
            user.setPassword(passwordEncoder.encode("user123"));
            user.setRole("USER");
            userRepository.save(user);
            System.out.println("Created default user: user@bookies.com / user123");
        }
    }
}