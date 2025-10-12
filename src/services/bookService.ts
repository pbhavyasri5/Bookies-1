import { Book } from "../types/book";

const BASE_URL = "http://localhost:8080/api/books"; // Your Spring Boot API

export async function getBooks(): Promise<Book[]> {
  const response = await fetch(BASE_URL);
  if (!response.ok) throw new Error("Failed to fetch books");
  return response.json();
}

export async function addBook(book: Book): Promise<Book> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book),
  });
  if (!response.ok) throw new Error("Failed to add book");
  return response.json();
}

export async function deleteBook(id: number): Promise<boolean> {
  const response = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete book");
  return true;
}

export async function updateBook(id: number, book: Book): Promise<Book> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book),
  });
  if (!response.ok) throw new Error("Failed to update book");
  return response.json();
}
