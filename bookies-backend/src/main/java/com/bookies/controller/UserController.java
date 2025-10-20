package com.bookies.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookies.model.User;
import com.bookies.repository.UserRepository;

@RestController
@RequestMapping("/api/users")
public class UserController {
    
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    /**
     * Signup Endpoint
     * POST /api/users/signup
     */
    @PostMapping("/signup")
    public ResponseEntity<Map<String, String>> signup(@RequestBody Map<String, String> request) {
        try {
            logger.info("Signup request received for email: {}", request.get("email"));
            
            String name = request.get("name");
            String email = request.get("email");
            String password = request.get("password");
            String accountType = request.get("accountType");
            
            // Validate: all fields non-empty
            if (name == null || name.trim().isEmpty()) {
                return createErrorResponse(HttpStatus.BAD_REQUEST, "Name is required");
            }
            if (email == null || email.trim().isEmpty()) {
                return createErrorResponse(HttpStatus.BAD_REQUEST, "Email is required");
            }
            // Validate: valid email format
            if (!EMAIL_PATTERN.matcher(email).matches()) {
                return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid email format");
            }
            if (password == null || password.trim().isEmpty()) {
                return createErrorResponse(HttpStatus.BAD_REQUEST, "Password is required");
            }
            // Validate: password ≥ 6 characters
            if (password.length() < 6) {
                return createErrorResponse(HttpStatus.BAD_REQUEST, "Password must be at least 6 characters");
            }
            
            // Check if email already exists
            if (userRepository.findByEmail(email).isPresent()) {
                logger.warn("Email already registered: {}", email);
                return createErrorResponse(HttpStatus.BAD_REQUEST, "Email already registered");
            }
            
            // Create user with hashed password
            User user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setAccountType(accountType != null && !accountType.trim().isEmpty() ? accountType : "USER");
            
            userRepository.save(user);
            logger.info("User registered: {} as {}", email, user.getAccountType());
            
            return createSuccessResponse(HttpStatus.CREATED, "Account created successfully");
            
        } catch (Exception e) {
            logger.error("Signup error", e);
            return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Server error, please try again later");
        }
    }
    
    /**
     * Login Endpoint
     * POST /api/users/login
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        try {
            logger.info("Login request for: {}", request.get("email"));
            
            String email = request.get("email");
            String password = request.get("password");
            
            if (email == null || email.trim().isEmpty()) {
                return createErrorResponseObj(HttpStatus.BAD_REQUEST, "Email is required");
            }
            if (password == null || password.trim().isEmpty()) {
                return createErrorResponseObj(HttpStatus.BAD_REQUEST, "Password is required");
            }
            
            // Find user by email (case-insensitive)
            User user = userRepository.findByEmailIgnoreCase(email).orElse(null);
            if (user == null) {
                logger.warn("User not found: {}", email);
                return createErrorResponseObj(HttpStatus.NOT_FOUND, "User not found");
            }
            
            // Check password with BCrypt
            if (!passwordEncoder.matches(password, user.getPassword())) {
                logger.warn("Invalid password for: {}", email);
                return createErrorResponseObj(HttpStatus.UNAUTHORIZED, "Invalid password");
            }
            
            // Return user details with accountType
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful");
            
            Map<String, Object> userObj = new HashMap<>();
            userObj.put("id", user.getId());
            userObj.put("name", user.getName());
            userObj.put("email", user.getEmail());
            userObj.put("accountType", user.getAccountType());
            
            response.put("user", userObj);
            
            logger.info("Login successful: {} as {}", email, user.getAccountType());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Login error", e);
            return createErrorResponseObj(HttpStatus.INTERNAL_SERVER_ERROR, "Server error, please try again later");
        }
    }
    
    /**
     * Change Password Endpoint
     * PUT /api/users/change-password
     */
    @PutMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(@RequestBody Map<String, String> request) {
        try {
            logger.info("Change password for: {}", request.get("email"));
            
            String email = request.get("email");
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");
            
            // Validate fields
            if (email == null || email.trim().isEmpty()) {
                return createErrorResponse(HttpStatus.BAD_REQUEST, "Email is required");
            }
            if (currentPassword == null || currentPassword.trim().isEmpty()) {
                return createErrorResponse(HttpStatus.BAD_REQUEST, "Current password is required");
            }
            if (newPassword == null || newPassword.trim().isEmpty()) {
                return createErrorResponse(HttpStatus.BAD_REQUEST, "New password is required");
            }
            if (newPassword.length() < 6) {
                return createErrorResponse(HttpStatus.BAD_REQUEST, "New password must be at least 6 characters");
            }
            
            // Find user
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                return createErrorResponse(HttpStatus.NOT_FOUND, "User not found");
            }
            
            // Verify current password
            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                logger.warn("Incorrect password for: {}", email);
                return createErrorResponse(HttpStatus.UNAUTHORIZED, "Incorrect current password");
            }
            
            // Update password
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            
            logger.info("Password updated for: {}", email);
            return createSuccessResponse(HttpStatus.OK, "Password updated successfully");
            
        } catch (Exception e) {
            logger.error("Change password error", e);
            return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Server error, please try again later");
        }
    }
    
    // Helper methods
    private ResponseEntity<Map<String, String>> createSuccessResponse(HttpStatus status, String message) {
        Map<String, String> response = new HashMap<>();
        response.put("message", message);
        return ResponseEntity.status(status).body(response);
    }
    
    private ResponseEntity<Map<String, String>> createErrorResponse(HttpStatus status, String message) {
        Map<String, String> response = new HashMap<>();
        response.put("message", message);
        return ResponseEntity.status(status).body(response);
    }
    
    private ResponseEntity<Map<String, Object>> createErrorResponseObj(HttpStatus status, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", message);
        return ResponseEntity.status(status).body(response);
    }
}
