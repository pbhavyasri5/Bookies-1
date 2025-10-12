package com.bookies.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bookies.model.Book;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
}
