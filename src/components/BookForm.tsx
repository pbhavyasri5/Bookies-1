import React, { useState } from 'react';
import { api } from '../services/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface BookFormProps {
  isAdmin: boolean;
  onBookAdded: () => void;
  editingBook?: {
    id: string;
    title: string;
    author: string;
    isbn?: string;
    category: string;
    publisher?: string;
    description?: string;
    coverImage?: string;
  };
  open?: boolean;
  onClose?: () => void;
}

const CATEGORIES = [
  "Fiction",
  "Non-Fiction",
  "Science",
  "Technology",
  "History",
  "Biography",
  "Business",
  "Self-Help",
  "Other"
];

const BookForm: React.FC<BookFormProps> = ({ isAdmin, onBookAdded, editingBook, open = true, onClose }) => {
  const [formData, setFormData] = useState({
    title: editingBook?.title || '',
    author: editingBook?.author || '',
    isbn: editingBook?.isbn || '',
    category: editingBook?.category || '',
    publisher: editingBook?.publisher || '',
    description: editingBook?.description || ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteImage, setDeleteImage] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let coverImage = editingBook?.coverImage || '';
      
      // Upload image if file is selected and user is admin
      if (selectedFile && isAdmin) {
        const uploadResponse = await api.upload.image(selectedFile);
        coverImage = uploadResponse.data;
      }

      const bookData = {
        ...formData,
        coverImage
      };

      if (editingBook) {
        await api.books.update(editingBook.id, bookData);
      } else {
        await api.books.create(bookData);
      }
      
      // Reset form
      setFormData({
        title: '',
        author: '',
        isbn: '',
        category: '',
        publisher: '',
        description: ''
      });
      setSelectedFile(null);
      
      onBookAdded();
      if (onClose) onClose();
    } catch (error) {
      console.error('Error saving book:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {editingBook ? 'Edit Book' : (isAdmin ? 'Add New Book' : 'Request Book')}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData({...formData, author: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                value={formData.isbn}
                onChange={(e) => setFormData({...formData, isbn: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({...formData, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="publisher">Publisher</Label>
              <Input
                id="publisher"
                value={formData.publisher}
                onChange={(e) => setFormData({...formData, publisher: e.target.value})}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
            />
          </div>
          
          {/* Image upload - only for admin */}
          {isAdmin && (
            <div className="space-y-2">
              <Label>Cover Image</Label>
              {editingBook?.coverImage && !deleteImage ? (
                <div className="space-y-2">
                  <img 
                    src={editingBook.coverImage}
                    alt="Current cover"
                    className="w-32 h-48 object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setDeleteImage(true)}
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-end gap-3">
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isUploading}>
              {isUploading ? 'Processing...' : (
                editingBook ? 'Save Changes' : (isAdmin ? 'Add Book' : 'Request Book')
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookForm;