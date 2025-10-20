import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Book } from "@/types/book";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface EditBookFormProps {
  book: Book | null;
  open: boolean;
  onClose: () => void;
  onBookUpdated: (updatedBook: Book) => void;
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

export function EditBookForm({ book, open, onClose, onBookUpdated }: EditBookFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    isbn: "",
    publisher: "",
    description: "",
    publishedDate: "",
    status: "available",
  });

  // Update form data when book changes
  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || "",
        author: book.author || "",
        category: book.category || "",
        isbn: book.isbn || "",
        publisher: book.publisher || "",
        description: book.description || "",
        publishedDate: book.publishedDate || "",
        status: book.status || "available",
      });
    }
  }, [book]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!book) return;

    // Validation
    if (!formData.title.trim() || !formData.author.trim() || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Title, Author, and Category are required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Make API call to update the book
      const response = await api.books.update(book.id, {
        ...book,
        title: formData.title.trim(),
        author: formData.author.trim(),
        category: formData.category,
        isbn: formData.isbn.trim(),
        publisher: formData.publisher.trim(),
        description: formData.description.trim(),
        publishedDate: formData.publishedDate || undefined,
        status: formData.status as any,
      });

      // Notify parent component about the update
      onBookUpdated(response.data);

      toast({
        title: "Success",
        description: `"${formData.title}" has been updated successfully.`,
      });

      onClose();
    } catch (error: any) {
      console.error("Error updating book:", error);
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || "Failed to update book. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Book Details</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter book title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Author */}
          <div className="space-y-2">
            <Label htmlFor="author">
              Author <span className="text-destructive">*</span>
            </Label>
            <Input
              id="author"
              placeholder="Enter author name"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
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

          {/* ISBN */}
          <div className="space-y-2">
            <Label htmlFor="isbn">ISBN</Label>
            <Input
              id="isbn"
              placeholder="Enter ISBN (optional)"
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              disabled={isSubmitting}
            />
          </div>

          {/* Publisher */}
          <div className="space-y-2">
            <Label htmlFor="publisher">Publisher</Label>
            <Input
              id="publisher"
              placeholder="Enter publisher name (optional)"
              value={formData.publisher}
              onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
              disabled={isSubmitting}
            />
          </div>

          {/* Published Date */}
          <div className="space-y-2">
            <Label htmlFor="publishedDate">Published Date</Label>
            <Input
              id="publishedDate"
              type="date"
              value={formData.publishedDate}
              onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })}
              disabled={isSubmitting}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="borrowed">Borrowed</SelectItem>
                <SelectItem value="pending_request">Pending Request</SelectItem>
                <SelectItem value="pending_return">Pending Return</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter book description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              disabled={isSubmitting}
              className="resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
