import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { BookFormData, Book } from "@/types/book";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface AddBookFormProps {
  onAddBook: (book: Book) => void;
}

const categories = [
  "Fiction",
  "Science",
  "History",
  "Biography", 
  "Children",
  "Technology",
  "Art",
  "Philosophy",
  "Mathematics",
  "Literature",
  "Health",
];

export function AddBookForm({ onAddBook }: AddBookFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState<BookFormData>({
    title: "",
    author: "",
    category: "",
    isbn: "",
    publisher: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.author || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Title, Author, and Category are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create book via backend API
      const response = await api.books.create({
        title: formData.title.trim(),
        author: formData.author.trim(),
        category: formData.category,
        isbn: formData.isbn?.trim() || "",
        publisher: formData.publisher?.trim() || "",
        description: formData.description?.trim() || "",
      });

      // No need to convert ID - already a number
      onAddBook(response.data);
      
      toast({
        title: "Success",
        description: `"${formData.title}" has been added to the library.`,
      });

      // Reset form
      setFormData({
        title: "",
        author: "",
        category: "",
        isbn: "",
        publisher: "",
        description: "",
      });
      setOpen(false);
    } catch (error: any) {
      console.error("Failed to add book:", error);
      toast({
        title: "Failed to Add Book",
        description: error.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="admin" className="shadow-elegant">
          <Plus className="h-4 w-4" />
          Add New Book
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Add New Book</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter book title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="author">Author *</Label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
              placeholder="Enter author name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="isbn">ISBN</Label>
            <Input
              id="isbn"
              value={formData.isbn}
              onChange={(e) => setFormData(prev => ({ ...prev, isbn: e.target.value }))}
              placeholder="Enter ISBN (optional)"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="publisher">Publisher</Label>
            <Input
              id="publisher"
              value={formData.publisher}
              onChange={(e) => setFormData(prev => ({ ...prev, publisher: e.target.value }))}
              placeholder="Enter publisher (optional)"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter book description (optional)"
              rows={3}
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" variant="admin" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Book"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}