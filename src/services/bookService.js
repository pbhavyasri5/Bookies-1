// src/services/bookService.js
const BASE_URL = "http://localhost:8080/api"; // Spring Boot backend URL

// Fetch all books
export async function getBooks() {
  const response = await fetch(`${BASE_URL}/books`);
  return response.json();
}

// Add a new book
export async function addBook(book) {
  const response = await fetch(`${BASE_URL}/books`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book),
  });
  return response.json();
}
