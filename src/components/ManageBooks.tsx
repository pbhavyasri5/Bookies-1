import React from 'react';
import { Book } from '@/types/book';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EditBookForm } from '@/components/EditBookForm';

interface ManageBooksProps {
  books: Book[];
  onUpdateBook: (book: Book) => void;
}

export function ManageBooks({ books, onUpdateBook }: ManageBooksProps) {
  const [editingBook, setEditingBook] = React.useState<Book | null>(null);

  const borrowedBooks = books.filter(book => book.status === 'borrowed');

  const handleEditClick = (book: Book) => {
    setEditingBook(book);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Manage Books</h2>
      
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Currently Borrowed Books</h3>
        {borrowedBooks.map((book) => (
          <Card key={book.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{book.title}</h4>
                  <p>Borrowed by: {book.borrowedBy}</p>
                  <p>Borrow Date: {new Date(book.borrowedDate || '').toLocaleDateString()}</p>
                  <p>Expected Return: {book.returnRequestDate ? 
                    new Date(book.returnRequestDate).toLocaleDateString() : 'Not set'}</p>
                </div>
                <Button onClick={() => handleEditClick(book)}>Edit</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Book Dialog */}
      <EditBookForm
        book={editingBook}
        open={editingBook !== null}
        onClose={() => setEditingBook(null)}
        onBookUpdated={onUpdateBook}
      />
    </div>
  );
}