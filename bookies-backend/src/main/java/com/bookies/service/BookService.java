package com.bookies.service;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookies.model.Book;
import com.bookies.repository.BookRepository;

@Service
public class BookService {
    
    private static final Logger logger = LoggerFactory.getLogger(BookService.class);
    
    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    public List<Book> getAllBooks() {
        logger.info("Fetching all books");
        return bookRepository.findAll();
    }

    public Optional<Book> getBookById(Long id) {
        logger.info("Fetching book with ID: {}", id);
        return bookRepository.findById(id);
    }

    @Transactional
    public Book createBook(Book book) {
        logger.info("Creating new book: {}", book.getTitle());
        return bookRepository.save(book);
    }

    @Transactional
    public Optional<Book> updateBook(Long id, Book bookDetails) {
        logger.info("Attempting to update book with ID: {}", id);
        
        return bookRepository.findById(id).map(existingBook -> {
            logger.info("Found book to update: {}", existingBook.getTitle());
            
            // Update all fields
            existingBook.setTitle(bookDetails.getTitle());
            existingBook.setAuthor(bookDetails.getAuthor());
            existingBook.setIsbn(bookDetails.getIsbn());
            existingBook.setCategory(bookDetails.getCategory());
            existingBook.setPublisher(bookDetails.getPublisher());
            existingBook.setDescription(bookDetails.getDescription());
            
            // Update optional fields only if provided
            if (bookDetails.getPublishedDate() != null) {
                existingBook.setPublishedDate(bookDetails.getPublishedDate());
            }
            if (bookDetails.getCoverImage() != null) {
                existingBook.setCoverImage(bookDetails.getCoverImage());
            }
            if (bookDetails.getStatus() != null) {
                existingBook.setStatus(bookDetails.getStatus());
            }
            
            // Save and return
            Book updatedBook = bookRepository.save(existingBook);
            logger.info("Successfully updated book: {}", updatedBook.getTitle());
            return updatedBook;
        });
    }

    @Transactional
    public boolean deleteBook(Long id) {
        logger.info("Attempting to delete book with ID: {}", id);
        
        return bookRepository.findById(id).map(book -> {
            bookRepository.delete(book);
            logger.info("Successfully deleted book: {}", book.getTitle());
            return true;
        }).orElse(false);
    }
}
