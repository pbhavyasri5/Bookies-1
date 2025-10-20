import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2, Image as ImageIcon, Clock, BookUp, Check, X, RotateCcw } from "lucide-react";
import { Book } from "@/types/book";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BookCardProps {
  book: Book;
  isAdmin: boolean;
  currentUser?: { email: string; isAdmin: boolean } | null;
  onEdit?: (book: Book) => void;
  onDelete?: (book: Book) => void;
  onImageUpload?: (book: Book, file: File) => void;
  onRequestBook?: (book: Book) => void;
  onReturnBook?: (book: Book) => void;
  onApproveRequest?: (book: Book, approve: boolean) => void;
  onApproveReturn?: (book: Book, approve: boolean) => void;
}

export function BookCard({ 
  book, 
  isAdmin, 
  currentUser,
  onEdit, 
  onDelete,
  onImageUpload,
  onRequestBook,
  onReturnBook,
  onApproveRequest,
  onApproveReturn 
}: BookCardProps) {
  const [isImageUploading, setIsImageUploading] = useState(false);
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      setIsImageUploading(true);
      try {
        await onImageUpload(book, file);
      } finally {
        setIsImageUploading(false);
      }
    }
  };

  const calculateDaysLeft = (borrowedDate: string) => {
    const borrowedTime = new Date(borrowedDate).getTime();
    const now = new Date().getTime();
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    const daysLeft = Math.ceil((borrowedTime + thirtyDaysInMs - now) / (24 * 60 * 60 * 1000));
    return Math.min(daysLeft, 30); // Cap at 30 days
  };

  const isBookBorrowedByUser = book.borrowedBy === currentUser?.email;
  const daysLeft = book.borrowedDate ? calculateDaysLeft(book.borrowedDate) : null;

  return (
    <Card className="group bg-card hover:shadow-book transition-all duration-300 overflow-hidden">
      <div className="aspect-[3/4] overflow-hidden relative">
        <img
          src={book.coverImage}
          alt={`Cover of ${book.title}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Change Image button - Admin Only */}
        {isAdmin && (
          <div className="absolute bottom-2 right-2">
            <Input
              type="file"
              accept="image/*"
              className="hidden"
              id={`image-upload-${book.id}`}
              onChange={handleImageUpload}
            />
            <Button
              size="sm"
              variant="secondary"
              className="bg-white hover:bg-gray-100"
              disabled={isImageUploading}
              onClick={() => document.getElementById(`image-upload-${book.id}`)?.click()}
            >
              <ImageIcon className="h-3 w-3 mr-1 text-blue-600" />
              {isImageUploading ? 'Uploading...' : 'Change Image'}
            </Button>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-card-foreground line-clamp-2 leading-tight">
            {book.title}
          </h3>
          
          <p className="text-sm text-muted-foreground line-clamp-1">
            by {book.author}
          </p>
          
          <div className="flex items-center justify-between">
            <Badge 
              variant={
                book.status === 'available' 
                  ? 'default' 
                  : book.status === 'pending_request' || book.status === 'pending_return'
                  ? 'outline'
                  : 'secondary'
              }
              className="text-xs"
            >
              {book.status === 'available' 
                ? 'Available' 
                : book.status === 'pending_request' 
                ? 'Request Pending'
                : book.status === 'pending_return'
                ? 'Return Pending'
                : 'Borrowed'}
            </Badge>
            
            <Badge variant="outline" className="text-xs">
              {book.category}
            </Badge>
          </div>
          
          {book.isbn && (
            <p className="text-xs text-muted-foreground">
              ISBN: {book.isbn}
            </p>
          )}

          {(book.status === 'borrowed' || book.status === 'pending_return') && book.borrowedBy && (
            <div className="text-xs text-muted-foreground">
              <p>Borrowed by: {isBookBorrowedByUser ? 'You' : book.borrowedBy}</p>
              {daysLeft !== null && book.status !== 'pending_return' && (
                <div className="flex items-center mt-1 text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  <span className={daysLeft < 3 ? 'text-destructive' : ''}>
                    {daysLeft} days left to return
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Approval Actions for Admin */}
          {isAdmin && (book.status === 'pending_request' || book.status === 'pending_return') && (
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="default"
                className="flex-1"
                onClick={() => book.status === 'pending_request' 
                  ? onApproveRequest?.(book, true)
                  : onApproveReturn?.(book, true)
                }
              >
                <Check className="h-3 w-3 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="flex-1"
                onClick={() => book.status === 'pending_request'
                  ? onApproveRequest?.(book, false)
                  : onApproveReturn?.(book, false)
                }
              >
                <X className="h-3 w-3 mr-1" />
                Reject
              </Button>
            </div>
          )}
          
          {/* Request/Return Actions for Users */}
          {!isAdmin && currentUser && (
            <>
              {book.status === 'available' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => onRequestBook?.(book)}
                >
                  <BookUp className="h-3 w-3 mr-1" />
                  Request Book
                </Button>
              )}
              
              {book.status === 'borrowed' && book.borrowedBy === currentUser.email && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => onReturnBook?.(book)}
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Return Book
                </Button>
              )}
            </>
          )}

          {/* Edit and Delete Buttons - Admin Only */}
          {isAdmin && (
            <div className="flex gap-2 pt-2">
              <Button 
                size="sm" 
                variant="gold" 
                onClick={() => onEdit?.(book)}
                className="flex-1"
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={() => onDelete?.(book)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}