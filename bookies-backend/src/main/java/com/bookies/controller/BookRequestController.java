package com.bookies.controller;

import com.bookies.dto.BookRequestDTO;
import com.bookies.model.Book;
import com.bookies.model.BookRequest;
import com.bookies.model.User;
import com.bookies.repository.BookRepository;
import com.bookies.repository.BookRequestRepository;
import com.bookies.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/book-requests")
@CrossOrigin(origins = {"http://localhost:8080", "http://localhost:8081", "http://localhost:5173", "http://localhost:3000"})
public class BookRequestController {
    
    private static final Logger logger = LoggerFactory.getLogger(BookRequestController.class);
    
    @Autowired
    private BookRequestRepository bookRequestRepository;
    
    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Create a new book request (borrow or return)
     */
    @PostMapping
    public ResponseEntity<BookRequestDTO> createBookRequest(@RequestBody Map<String, Object> request) {
        logger.info("Creating book request: {}", request);
        
        try {
            // Validate request data
            if (request.get("bookId") == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Book ID is required");
            }
            if (request.get("userEmail") == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User email is required");
            }
            if (request.get("requestType") == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request type is required");
            }
            
            Long bookId = Long.parseLong(request.get("bookId").toString());
            String userEmail = request.get("userEmail").toString();
            String requestType = request.get("requestType").toString(); // "BORROW" or "RETURN"
            
            logger.info("Processing request - BookId: {}, UserEmail: {}, Type: {}", bookId, userEmail, requestType);
            
            Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found with ID: " + bookId));
            
            User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with email: " + userEmail));
            
            // Check if there's already a pending request for this book by this user
            List<BookRequest> existingRequests = bookRequestRepository.findByBookIdAndStatus(bookId, "PENDING");
            for (BookRequest existing : existingRequests) {
                if (existing.getUser().getId().equals(user.getId()) && existing.getRequestType().equals(requestType)) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "You already have a pending " + requestType.toLowerCase() + " request for this book");
                }
            }
            
            BookRequest bookRequest = new BookRequest(book, user, requestType);
            if (request.containsKey("notes")) {
                bookRequest.setNotes(request.get("notes").toString());
            }
            
            BookRequest saved = bookRequestRepository.save(bookRequest);
            logger.info("Book request created successfully: ID={}, Type={}, User={}", saved.getId(), requestType, userEmail);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(new BookRequestDTO(saved));
            
        } catch (ResponseStatusException e) {
            logger.error("Request failed: {}", e.getReason());
            throw e;
        } catch (NumberFormatException e) {
            logger.error("Invalid book ID format: {}", request.get("bookId"));
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid book ID format");
        } catch (Exception e) {
            logger.error("Error creating book request", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error occurred: " + e.getMessage());
        }
    }
    
    /**
     * Get all pending requests (Admin only)
     */
    @GetMapping("/pending")
    public ResponseEntity<List<BookRequestDTO>> getPendingRequests() {
        logger.info("Fetching all pending book requests");
        
        List<BookRequest> requests = bookRequestRepository.findByStatusOrderByRequestedAtDesc("PENDING");
        List<BookRequestDTO> dtos = requests.stream()
            .map(BookRequestDTO::new)
            .collect(Collectors.toList());
        
        logger.info("Found {} pending requests", dtos.size());
        return ResponseEntity.ok(dtos);
    }
    
    /**
     * Get requests by user
     */
    @GetMapping("/user/{email}")
    public ResponseEntity<List<BookRequestDTO>> getUserRequests(@PathVariable String email) {
        logger.info("Fetching book requests for user: {}", email);
        
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        List<BookRequest> requests = bookRequestRepository.findByUserOrderByRequestedAtDesc(user);
        List<BookRequestDTO> dtos = requests.stream()
            .map(BookRequestDTO::new)
            .collect(Collectors.toList());
        
        logger.info("Found {} requests for user {}", dtos.size(), email);
        return ResponseEntity.ok(dtos);
    }
    
    /**
     * Get a specific request by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<BookRequestDTO> getRequest(@PathVariable Long id) {
        logger.info("Fetching book request: {}", id);
        
        BookRequest request = bookRequestRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));
        
        return ResponseEntity.ok(new BookRequestDTO(request));
    }
    
    /**
     * Approve a book request (Admin only)
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveRequest(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> body) {
        
        logger.info("Approving book request: {}", id);
        
        BookRequest request = bookRequestRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));
        
        if (!"PENDING".equals(request.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request has already been processed");
        }
        
        // Get admin email from request body
        String adminEmail = body != null && body.containsKey("adminEmail") 
            ? body.get("adminEmail").toString() 
            : null;
        
        User admin = null;
        if (adminEmail != null) {
            admin = userRepository.findByEmail(adminEmail).orElse(null);
        }
        
        // Update request status
        request.setStatus("APPROVED");
        request.setProcessedAt(LocalDateTime.now());
        if (admin != null) {
            request.setProcessedBy(admin);
        }
        
        // Update book status based on request type
        Book book = request.getBook();
        if ("BORROW".equals(request.getRequestType())) {
            book.setStatus("borrowed");
            book.setBorrowedBy(request.getUser().getEmail());
            book.setBorrowedDate(LocalDateTime.now().toString());
        } else if ("RETURN".equals(request.getRequestType())) {
            book.setStatus("available");
            book.setBorrowedBy(null);
            book.setBorrowedDate(null);
        }
        
        bookRepository.save(book);
        BookRequest saved = bookRequestRepository.save(request);
        
        logger.info("Book request approved: ID={}, Type={}, Book={}", id, request.getRequestType(), book.getTitle());
        
        Map<String, Object> response = new HashMap<>();
        response.put("request", new BookRequestDTO(saved));
        response.put("book", book);
        response.put("message", "Request approved successfully");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Reject a book request (Admin only)
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<Map<String, Object>> rejectRequest(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> body) {
        
        logger.info("Rejecting book request: {}", id);
        
        BookRequest request = bookRequestRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));
        
        if (!"PENDING".equals(request.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request has already been processed");
        }
        
        // Get admin email and rejection notes from request body
        String adminEmail = body != null && body.containsKey("adminEmail") 
            ? body.get("adminEmail").toString() 
            : null;
        String notes = body != null && body.containsKey("notes") 
            ? body.get("notes").toString() 
            : null;
        
        User admin = null;
        if (adminEmail != null) {
            admin = userRepository.findByEmail(adminEmail).orElse(null);
        }
        
        // Update request status
        request.setStatus("REJECTED");
        request.setProcessedAt(LocalDateTime.now());
        if (admin != null) {
            request.setProcessedBy(admin);
        }
        if (notes != null) {
            request.setNotes(notes);
        }
        
        BookRequest saved = bookRequestRepository.save(request);
        
        logger.info("Book request rejected: ID={}, Type={}, Reason={}", id, request.getRequestType(), notes);
        
        Map<String, Object> response = new HashMap<>();
        response.put("request", new BookRequestDTO(saved));
        response.put("message", "Request rejected successfully");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Delete a book request
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteRequest(@PathVariable Long id) {
        logger.info("Deleting book request: {}", id);
        
        BookRequest request = bookRequestRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));
        
        bookRequestRepository.delete(request);
        
        logger.info("Book request deleted: {}", id);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Request deleted successfully");
        return ResponseEntity.ok(response);
    }
}
