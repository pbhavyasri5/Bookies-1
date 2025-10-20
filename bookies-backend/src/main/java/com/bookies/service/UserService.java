package com.bookies.service;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookies.dto.LoginRequest;
import com.bookies.dto.LoginResponse;
import com.bookies.dto.SignupRequest;
import com.bookies.dto.SignupResponse;
import com.bookies.exception.DuplicateEmailException;
import com.bookies.exception.InvalidCredentialsException;
import com.bookies.model.User;
import com.bookies.repository.UserRepository;

@Service
public class UserService {
    
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Register a new user with hashed password
     */
    @Transactional
    public SignupResponse signup(SignupRequest request) {
        logger.info("Attempting to register new user with email: {}", request.getEmail());
        
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            logger.warn("Registration failed: Email already exists - {}", request.getEmail());
            throw new DuplicateEmailException("An account with this email already exists");
        }

        // Validate password strength
        validatePasswordStrength(request.getPassword());

        // Create new user with hashed password
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // Hash password with bcrypt
        user.setRole(request.getRole() != null ? request.getRole() : "USER");

        User savedUser = userRepository.save(user);
        logger.info("User registered successfully: {} with role: {}", savedUser.getEmail(), savedUser.getRole());

        return new SignupResponse(
            savedUser.getId(),
            savedUser.getName(),
            savedUser.getEmail(),
            savedUser.getRole(),
            "User registered successfully"
        );
    }

    /**
     * Authenticate user and generate token
     */
    public LoginResponse signin(LoginRequest request) {
        logger.info("Login attempt for email: {}", request.getEmail());
        
        // Find user by email
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        
        if (!userOpt.isPresent()) {
            logger.warn("Login failed: User not found - {}", request.getEmail());
            throw new InvalidCredentialsException("Invalid email or password");
        }

        User user = userOpt.get();
        
        // Verify password using bcrypt
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            logger.warn("Login failed: Incorrect password for user - {}", request.getEmail());
            throw new InvalidCredentialsException("Invalid email or password");
        }

        // Generate token (in production, use JWT library)
        String token = generateToken(user);
        
        logger.info("User logged in successfully: {} with role: {}", user.getEmail(), user.getRole());

        return new LoginResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole(),
            token,
            "Login successful"
        );
    }

    /**
     * Validate password strength
     */
    private void validatePasswordStrength(String password) {
        if (password == null || password.length() < 4) {
            throw new IllegalArgumentException("Password must be at least 4 characters long");
        }
        // Add more validation rules as needed
        // - Must contain uppercase, lowercase, number, special character
        // - Cannot be common passwords
    }

    /**
     * Generate authentication token
     * In production, use JWT library (io.jsonwebtoken:jjwt)
     */
    private String generateToken(User user) {
        // Simple token for development - use JWT in production
        return user.getEmail() + "_" + System.currentTimeMillis();
    }

    /**
     * Find user by email
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Check if email exists
     */
    public boolean emailExists(String email) {
        return userRepository.findByEmail(email).isPresent();
    }
}
