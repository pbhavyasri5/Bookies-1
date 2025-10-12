import React, { useEffect, useState } from "react";
import { getBooks, addBook } from "../services/bookService";

function BookList() {
  const [books, setBooks] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    price: "",
    publishedDate: "",
  });

  useEffect(() => {
    getBooks().then((data) => setBooks(data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newBook = await addBook(formData);
    setBooks([...books, newBook]);
    setFormData({ title: "", author: "", price: "", publishedDate: "" });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📚 Book List</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Author"
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
        />
        <input
          type="number"
          placeholder="Price"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        />
        <input
          type="date"
          value={formData.publishedDate}
          onChange={(e) =>
            setFormData({ ...formData, publishedDate: e.target.value })
          }
        />
        <button type="submit">Add Book</button>
      </form>

      <ul>
        {books.length > 0 ? (
          books.map((b) => (
            <li key={b.id}>
              <strong>{b.title}</strong> by {b.author} — ₹{b.price}
            </li>
          ))
        ) : (
          <p>No books found</p>
        )}
      </ul>
    </div>
  );
}

export default BookList;
