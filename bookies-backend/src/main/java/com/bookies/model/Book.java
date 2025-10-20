package com.bookies.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "books")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Author is required")
    private String author;

    private String isbn;
    
    @Column(name = "category")
    private String category;
    
    private String publisher;
    private String description;
    
    @Column(name = "price")
    private Double price;
    
    @Column(name = "published_date")
    private String publishedDate;

    @Column(name = "cover_image")
    private String coverImage;
    
    @Column(name = "status")
    private String status = "available";
    
    @Column(name = "borrowed_by")
    private String borrowedBy;
    
    @Column(name = "borrowed_date")
    private String borrowedDate;

    @Column(name = "requested_by")
    private String requestedBy;

    @Column(name = "request_date")
    private String requestDate;

    @Column(name = "return_request_date")
    private String returnRequestDate;

    @Column(name = "approval_status")
    private String approvalStatus;

    @Column(name = "added_date")
    private String addedDate = java.time.LocalDate.now().toString();

    // Constructors
    public Book() {}

    public Book(String title, String author, String isbn, String category) {
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.category = category;
        this.status = "available";
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getPublisher() { return publisher; }
    public void setPublisher(String publisher) { this.publisher = publisher; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCoverImage() { return coverImage; }
    public void setCoverImage(String coverImage) { this.coverImage = coverImage; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getBorrowedBy() { return borrowedBy; }
    public void setBorrowedBy(String borrowedBy) { this.borrowedBy = borrowedBy; }

    public String getBorrowedDate() { return borrowedDate; }
    public void setBorrowedDate(String borrowedDate) { this.borrowedDate = borrowedDate; }

    public String getRequestedBy() { return requestedBy; }
    public void setRequestedBy(String requestedBy) { this.requestedBy = requestedBy; }

    public String getRequestDate() { return requestDate; }
    public void setRequestDate(String requestDate) { this.requestDate = requestDate; }

    public String getReturnRequestDate() { return returnRequestDate; }
    public void setReturnRequestDate(String returnRequestDate) { this.returnRequestDate = returnRequestDate; }

    public String getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; }

    public String getAddedDate() { return addedDate; }
    public void setAddedDate(String addedDate) { this.addedDate = addedDate; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getPublishedDate() { return publishedDate; }
    public void setPublishedDate(String publishedDate) { this.publishedDate = publishedDate; }
}