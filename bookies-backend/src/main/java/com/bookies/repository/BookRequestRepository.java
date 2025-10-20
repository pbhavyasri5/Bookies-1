package com.bookies.repository;

import com.bookies.model.BookRequest;
import com.bookies.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRequestRepository extends JpaRepository<BookRequest, Long> {
    
    List<BookRequest> findByStatus(String status);
    
    List<BookRequest> findByUser(User user);
    
    List<BookRequest> findByUserAndStatus(User user, String status);
    
    List<BookRequest> findByBookIdAndStatus(Long bookId, String status);
    
    List<BookRequest> findByUserOrderByRequestedAtDesc(User user);
    
    List<BookRequest> findByStatusOrderByRequestedAtDesc(String status);
}
