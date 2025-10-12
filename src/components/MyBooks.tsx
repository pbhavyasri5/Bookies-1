import React from 'react';
import { Book } from '@/types/book';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';

interface MyBooksProps {
  userEmail: string;
}

export function MyBooks({ userEmail }: MyBooksProps) {
  const [books, setBooks] = React.useState<Book[]>([]);
  const { toast } = useToast();

  React.useEffect(() => {
    fetchMyBooks();
  }, [userEmail]);

  const fetchMyBooks = async () => {
    try {
      const response = await api.books.getAll();
      const myBooks = response.data.filter(book => book.borrowedBy === userEmail);
      setBooks(myBooks);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch your books",
        variant: "destructive",
      });
    }
  };

  const calculateRemainingDays = (returnDate: string) => {
    const today = new Date();
    const return_date = new Date(returnDate);
    const diffTime = return_date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My Books</h2>
      {books.length === 0 ? (
        <p>You haven't borrowed any books yet.</p>
      ) : (
        <div className="space-y-4">
          {books.map((book) => (
            <Card key={book.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{book.title}</h4>
                    <p>Author: {book.author}</p>
                    <p>Borrow Date: {new Date(book.borrowedDate || '').toLocaleDateString()}</p>
                    {book.returnRequestDate && (
                      <>
                        <p>Return Date: {new Date(book.returnRequestDate).toLocaleDateString()}</p>
                        <p>Days Remaining: {calculateRemainingDays(book.returnRequestDate)}</p>
                      </>
                    )}
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      // TODO: Implement return request functionality
                      toast({
                        title: "Return Request",
                        description: "Return request submitted",
                      });
                    }}
                  >
                    Request Return
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}