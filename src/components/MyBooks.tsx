import React from 'react';
import { Book } from '@/types/book';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, RotateCcw } from 'lucide-react';

interface MyBooksProps {
  userEmail: string;
  books: Book[];
  onReturnBook?: (book: Book) => void;
}

export function MyBooks({ userEmail, books, onReturnBook }: MyBooksProps) {
  // Filter books borrowed by this user
  const myBooks = React.useMemo(() => {
    return books.filter(book => 
      (book.status?.toLowerCase() === 'borrowed' || book.status?.toLowerCase() === 'pending_return') && 
      book.borrowedBy === userEmail
    );
  }, [books, userEmail]);

  const calculateDaysLeft = (borrowedDate: string) => {
    const borrowedTime = new Date(borrowedDate).getTime();
    const now = new Date().getTime();
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    const daysLeft = Math.ceil((borrowedTime + thirtyDaysInMs - now) / (24 * 60 * 60 * 1000));
    return Math.max(0, Math.min(daysLeft, 30)); // Between 0-30 days
  };

  return (
    <div className="space-y-4">
      {myBooks.length === 0 ? (
        <p className="text-sm text-muted-foreground">You haven't borrowed any books yet.</p>
      ) : (
        <div className="space-y-3">
          {myBooks.map((book) => {
            const daysLeft = book.borrowedDate ? calculateDaysLeft(book.borrowedDate) : null;
            const isPendingReturn = book.status === 'pending_return';
            
            return (
              <Card key={book.id} className="bg-card/50">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm line-clamp-1">{book.title}</h4>
                    <p className="text-xs text-muted-foreground">by {book.author}</p>
                    
                    {book.borrowedDate && (
                      <div className="text-xs text-muted-foreground">
                        <p>Borrowed: {new Date(book.borrowedDate).toLocaleDateString()}</p>
                        {daysLeft !== null && !isPendingReturn && (
                          <div className="flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            <span className={daysLeft < 3 ? 'text-destructive font-semibold' : ''}>
                              {daysLeft} days left
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {isPendingReturn ? (
                      <div className="bg-yellow-100 dark:bg-yellow-900/20 px-2 py-1 rounded text-xs text-yellow-800 dark:text-yellow-200">
                        Return request pending approval
                      </div>
                    ) : (
                      <Button 
                        size="sm"
                        variant="outline"
                        className="w-full mt-2"
                        onClick={() => onReturnBook?.(book)}
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Request Return
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}