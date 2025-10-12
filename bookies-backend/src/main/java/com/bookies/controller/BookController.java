package com.bookies.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookies.model.Book;
import com.bookies.repository.BookRepository;

@RestController
@RequestMapping("/api/books")
public class BookController {
    
    private static final Logger logger = LoggerFactory.getLogger(BookController.class);

    private final BookRepository bookRepository;

    public BookController(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    @GetMapping
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    @PostMapping
    public Book createBook(@RequestBody Book book) {
        return bookRepository.save(book);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Book> updateBook(@PathVariable Long id, @RequestBody Book bookDetails) {
        logger.info("Received update request for book ID: {}", id);
        logger.debug("Update details: {}", bookDetails);
        
        return bookRepository.findById(id)
            .map(book -> {
                logger.info("Found existing book with ID: {}", id);
                book.setTitle(bookDetails.getTitle());
                book.setAuthor(bookDetails.getAuthor());
                book.setIsbn(bookDetails.getIsbn());
                book.setCategory(bookDetails.getCategory());
                book.setPublisher(bookDetails.getPublisher());
                book.setDescription(bookDetails.getDescription());
                if (bookDetails.getCoverImage() != null) {
                    book.setCoverImage(bookDetails.getCoverImage());
                }
                if (bookDetails.getStatus() != null) {
                    book.setStatus(bookDetails.getStatus());
                }
                if (bookDetails.getBorrowedBy() != null) {
                    book.setBorrowedBy(bookDetails.getBorrowedBy());
                }
                if (bookDetails.getBorrowedDate() != null) {
                    book.setBorrowedDate(bookDetails.getBorrowedDate());
                }
                if (bookDetails.getRequestedBy() != null) {
                    book.setRequestedBy(bookDetails.getRequestedBy());
                }
                if (bookDetails.getRequestDate() != null) {
                    book.setRequestDate(bookDetails.getRequestDate());
                }
                if (bookDetails.getReturnRequestDate() != null) {
                    book.setReturnRequestDate(bookDetails.getReturnRequestDate());
                }
                if (bookDetails.getApprovalStatus() != null) {
                    book.setApprovalStatus(bookDetails.getApprovalStatus());
                }
                Book updatedBook = bookRepository.save(book);
                logger.info("Successfully updated book with ID: {}", id);
                return ResponseEntity.ok(updatedBook);
            })
            .orElseGet(() -> {
                logger.warn("Book not found with ID: {}", id);
                return ResponseEntity.notFound().build();
            });
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        return bookRepository.findById(id)
            .map(book -> {
                bookRepository.delete(book);
                return ResponseEntity.ok().<Void>build();
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
