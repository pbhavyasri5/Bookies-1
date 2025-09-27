import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2, Eye } from "lucide-react";
import { Book } from "@/types/book";

interface BookCardProps {
  book: Book;
  isAdmin: boolean;
  onEdit?: (book: Book) => void;
  onDelete?: (book: Book) => void;
  onView?: (book: Book) => void;
}

export function BookCard({ book, isAdmin, onEdit, onDelete, onView }: BookCardProps) {
  return (
    <Card className="group bg-card hover:shadow-book transition-all duration-300 overflow-hidden">
      <div className="aspect-[3/4] overflow-hidden">
        <img
          src={book.coverImage}
          alt={`Cover of ${book.title}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
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
              variant={book.status === 'available' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {book.status === 'available' ? 'Available' : 'Borrowed'}
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
          
          <div className="flex gap-2 pt-2">
            {isAdmin ? (
              <>
                <Button 
                  size="sm" 
                  variant="gold" 
                  onClick={() => onEdit?.(book)}
                  className="flex-1"
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => onDelete?.(book)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <Button 
                size="sm" 
                variant="default" 
                onClick={() => onView?.(book)}
                className="w-full"
              >
                <Eye className="h-3 w-3" />
                View Details
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}