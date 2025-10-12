import React from 'react';
import { Book } from '@/types/book';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface ManageBooksProps {
  books: Book[];
  onUpdateBook: (book: Book) => void;
}

export function ManageBooks({ books, onUpdateBook }: ManageBooksProps) {
  const { toast } = useToast();
  const [editingBook, setEditingBook] = React.useState<Book | null>(null);
  const [editForm, setEditForm] = React.useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    status: ''
  });

  const borrowedBooks = books.filter(book => book.status === 'borrowed');

  const handleEditClick = (book: Book) => {
    setEditingBook(book);
    setEditForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn || '',
      category: book.category,
      status: book.status
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;

    try {
      const response = await api.books.update(editingBook.id, {
        ...editingBook,
        ...editForm
      });
      onUpdateBook(response.data);
      toast({
        title: "Success",
        description: "Book updated successfully",
      });
      setEditingBook(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update book",
        variant: "destructive",
      });
    }
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
                <Dialog>
                  <DialogTrigger asChild>
                    <Button onClick={() => handleEditClick(book)}>Edit</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Book</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="author">Author</Label>
                        <Input
                          id="author"
                          value={editForm.author}
                          onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="isbn">ISBN</Label>
                        <Input
                          id="isbn"
                          value={editForm.isbn}
                          onChange={(e) => setEditForm({ ...editForm, isbn: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Genre</Label>
                        <Input
                          id="category"
                          value={editForm.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="status">Availability</Label>
                        <select
                          id="status"
                          value={editForm.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          className="w-full p-2 border rounded"
                        >
                          <option value="available">Available</option>
                          <option value="borrowed">Borrowed</option>
                        </select>
                      </div>
                      <Button type="submit">Save Changes</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}