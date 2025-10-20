package com.bookies.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookies.dto.LoginRequest;
import com.bookies.dto.LoginResponse;
import com.bookies.dto.SignupRequest;
import com.bookies.dto.SignupResponse;
import com.bookies.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Signup endpoint - Register a new user
     * POST /api/auth/signup
     * 
     * Request Body:
     * {
     *   "name": "John Doe",
     *   "email": "john@example.com",
     *   "password": "securePassword123",
     *   "role": "USER"  // Optional, defaults to "USER"
     * }
     * 
     * Success Response (201):
     * {
     *   "id": 1,
     *   "name": "John Doe",
     *   "email": "john@example.com",
     *   "role": "USER",
     *   "message": "User registered successfully"
     * }
     * 
     * Error Response (409 - Duplicate Email):
     * {
     *   "timestamp": "2025-10-18T...",
     *   "status": 409,
     *   "error": "Duplicate Email",
     *   "message": "An account with this email already exists"
     * }
     */
    @PostMapping("/signup")
    public ResponseEntity<SignupResponse> signup(@Valid @RequestBody SignupRequest request) {
        logger.info("Signup request received for email: {}", request.getEmail());
        
        SignupResponse response = userService.signup(request);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Signin/Login endpoint - Authenticate existing user
     * POST /api/auth/signin
     * 
     * Request Body:
     * {
     *   "email": "john@example.com",
     *   "password": "securePassword123"
     * }
     * 
     * Success Response (200):
     * {
     *   "id": 1,
     *   "name": "John Doe",
     *   "email": "john@example.com",
     *   "role": "USER",
     *   "token": "john@example.com_1729260000000",
     *   "message": "Login successful"
     * }
     * 
     * Error Response (401 - Invalid Credentials):
     * {
     *   "timestamp": "2025-10-18T...",
     *   "status": 401,
     *   "error": "Authentication Failed",
     *   "message": "Invalid email or password"
     * }
     */
    @PostMapping("/signin")
    public ResponseEntity<LoginResponse> signin(@Valid @RequestBody LoginRequest request) {
        logger.info("Signin request received for email: {}", request.getEmail());
        
        LoginResponse response = userService.signin(request);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Legacy login endpoint for backward compatibility
     * Redirects to /signin
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        logger.info("Login request received (legacy endpoint), redirecting to signin");
        return signin(request);
    }

    /**
     * Legacy register endpoint for backward compatibility
     * Redirects to /signup
     */
    @PostMapping("/register")
    public ResponseEntity<SignupResponse> register(@Valid @RequestBody SignupRequest request) {
        logger.info("Register request received (legacy endpoint), redirecting to signup");
        return signup(request);
    }
}
