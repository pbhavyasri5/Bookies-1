package com.bookies.dto;

import com.bookies.model.BookRequest;
import java.time.LocalDateTime;

public class BookRequestDTO {
    
    private Long id;
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;
    private Long userId;
    private String userEmail;
    private String userName;
    private String requestType;
    private String status;
    private LocalDateTime requestedAt;
    private LocalDateTime processedAt;
    private String processedByEmail;
    private String notes;
    
    // Constructors
    public BookRequestDTO() {}
    
    public BookRequestDTO(BookRequest request) {
        this.id = request.getId();
        this.bookId = request.getBook().getId();
        this.bookTitle = request.getBook().getTitle();
        this.bookAuthor = request.getBook().getAuthor();
        this.userId = request.getUser().getId();
        this.userEmail = request.getUser().getEmail();
        this.userName = request.getUser().getName();
        this.requestType = request.getRequestType();
        this.status = request.getStatus();
        this.requestedAt = request.getRequestedAt();
        this.processedAt = request.getProcessedAt();
        if (request.getProcessedBy() != null) {
            this.processedByEmail = request.getProcessedBy().getEmail();
        }
        this.notes = request.getNotes();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getBookId() {
        return bookId;
    }
    
    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }
    
    public String getBookTitle() {
        return bookTitle;
    }
    
    public void setBookTitle(String bookTitle) {
        this.bookTitle = bookTitle;
    }
    
    public String getBookAuthor() {
        return bookAuthor;
    }
    
    public void setBookAuthor(String bookAuthor) {
        this.bookAuthor = bookAuthor;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getUserEmail() {
        return userEmail;
    }
    
    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }
    
    public String getUserName() {
        return userName;
    }
    
    public void setUserName(String userName) {
        this.userName = userName;
    }
    
    public String getRequestType() {
        return requestType;
    }
    
    public void setRequestType(String requestType) {
        this.requestType = requestType;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }
    
    public void setRequestedAt(LocalDateTime requestedAt) {
        this.requestedAt = requestedAt;
    }
    
    public LocalDateTime getProcessedAt() {
        return processedAt;
    }
    
    public void setProcessedAt(LocalDateTime processedAt) {
        this.processedAt = processedAt;
    }
    
    public String getProcessedByEmail() {
        return processedByEmail;
    }
    
    public void setProcessedByEmail(String processedByEmail) {
        this.processedByEmail = processedByEmail;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
}
