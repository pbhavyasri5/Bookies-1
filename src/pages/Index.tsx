import { useState, useMemo } from "react";
import { LibraryHeader } from "@/components/LibraryHeader";
import { SearchBar } from "@/components/SearchBar";
import { SidebarNav } from "@/components/SidebarNav";
import { BookCard } from "@/components/BookCard";
import { AddBookForm } from "@/components/AddBookForm";
import { AuthPage } from "@/components/AuthPage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sampleBooks } from "@/data/sampleBooks";
import { Book } from "@/types/book";
import { BookOpen, Users, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [books, setBooks] = useState<Book[]>(sampleBooks);
  const [user, setUser] = useState<{ email: string; isAdmin: boolean } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const { toast } = useToast();

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = searchQuery === "" || 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.isbn?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "All Categories" || 
        book.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [books, searchQuery, selectedCategory]);

  const handleLogin = (email: string, isAdmin: boolean) => {
    setUser({ email, isAdmin });
    toast({
      title: "Welcome Back!",
      description: `Logged in as ${isAdmin ? 'Admin' : 'User'}`,
    });
  };

  const handleSignUp = (email: string, isAdmin: boolean) => {
    setUser({ email, isAdmin });
    toast({
      title: "Welcome to the Library!",
      description: `Account created successfully as ${isAdmin ? 'Admin' : 'User'}`,
    });
  };

  const handleLogout = () => {
    setUser(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const handleAddBook = (newBook: Book) => {
    setBooks(prev => [newBook, ...prev]);
    toast({
      title: "Book Added",
      description: `"${newBook.title}" has been added to the library.`,
    });
  };

  const handleEditBook = (updatedBook: Book) => {
    setBooks(prev => prev.map(book => 
      book.id === updatedBook.id ? updatedBook : book
    ));
    toast({
      title: "Book Updated",
      description: `"${updatedBook.title}" has been updated successfully.`,
    });
  };

  const handleDeleteBook = (book: Book) => {
    setBooks(prev => prev.filter(b => b.id !== book.id));
    toast({
      title: "Book Removed",
      description: `"${book.title}" has been removed from the library.`,
      variant: "destructive",
    });
  };

  const handleImageUpload = async (book: Book, file: File) => {
    try {
      // TODO: Implement actual image upload to backend
      // For now, create a local URL for demo
      const imageUrl = URL.createObjectURL(file);
      setBooks(prev => prev.map(b => 
        b.id === book.id ? { ...b, coverImage: imageUrl } : b
      ));
      toast({
        title: "Image Updated",
        description: `Cover image for "${book.title}" has been updated.`,
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRequestBook = (book: Book) => {
    if (!user) return;
    
    // Update book status to pending request
    setBooks(prev => prev.map(b => 
      b.id === book.id ? {
        ...b,
        status: 'pending_request',
        requestedBy: user.email,
        requestDate: new Date().toISOString(),
        approvalStatus: 'pending'
      } : b
    ));

    toast({
      title: "Request Submitted",
      description: `Your request for "${book.title}" is pending admin approval.`,
    });
  };

  const handleReturnBook = (book: Book) => {
    if (!user) return;
    
    // Update book status to pending return
    setBooks(prev => prev.map(b => 
      b.id === book.id ? {
        ...b,
        status: 'pending_return',
        returnRequestDate: new Date().toISOString(),
        approvalStatus: 'pending'
      } : b
    ));

    toast({
      title: "Return Requested",
      description: `Your return request for "${book.title}" is pending admin approval.`,
    });
  };

  const handleApproveRequest = (book: Book, approve: boolean) => {
    const borrowDate = new Date();
    // Ensure year is 2025
    if (borrowDate.getFullYear() < 2025) {
      borrowDate.setFullYear(2025);
    }

    setBooks(prev => prev.map(b => 
      b.id === book.id ? {
        ...b,
        status: approve ? 'borrowed' : 'available',
        borrowedBy: approve ? book.requestedBy : undefined,
        borrowedDate: approve ? borrowDate.toISOString() : undefined,
        requestedBy: undefined,
        requestDate: undefined,
        approvalStatus: undefined
      } : b
    ));

    toast({
      title: approve ? "Request Approved" : "Request Rejected",
      description: `The request for "${book.title}" has been ${approve ? 'approved' : 'rejected'}.`,
      variant: approve ? "default" : "destructive",
    });
  };

  const handleApproveReturn = (book: Book, approve: boolean) => {
    if (!approve) {
      // Reject return - keep book as borrowed
      setBooks(prev => prev.map(b => 
        b.id === book.id ? {
          ...b,
          status: 'borrowed',
          returnRequestDate: undefined,
          approvalStatus: undefined
        } : b
      ));

      toast({
        title: "Return Rejected",
        description: `The return request for "${book.title}" has been rejected. Please check the book condition.`,
        variant: "destructive",
      });
    } else {
      // Approve return - make book available again
      setBooks(prev => prev.map(b => 
        b.id === book.id ? {
          ...b,
          status: 'available',
          borrowedBy: undefined,
          borrowedDate: undefined,
          returnRequestDate: undefined,
          approvalStatus: undefined
        } : b
      ));

      toast({
        title: "Return Approved",
        description: `"${book.title}" has been successfully returned to the library.`,
      });
    }
  };


  const totalBooks = books.length;
  const availableBooks = books.filter(b => b.status === 'available').length;
  const borrowedBooks = books.filter(b => b.status === 'borrowed').length;



  // Show only auth page when not logged in
  if (!user) {
    return <AuthPage onLogin={handleLogin} onSignUp={handleSignUp} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <LibraryHeader
        user={user}
        onLogin={handleLogin}
        onSignUp={handleSignUp}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen border-r border-accent/20">
          <SidebarNav
            isAdmin={user.isAdmin}
            userEmail={user.email}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            books={books}
            onUpdateBook={handleEditBook}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-6 py-8">
          {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card/95 backdrop-blur-sm rounded-lg p-6 border border-accent/20 shadow-elegant">
            <div className="flex items-center gap-3">
              <div className="bg-accent/20 p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{totalBooks}</p>
                <p className="text-sm text-muted-foreground">Total Books</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card/95 backdrop-blur-sm rounded-lg p-6 border border-accent/20 shadow-elegant">
            <div className="flex items-center gap-3">
              <div className="bg-accent/20 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{availableBooks}</p>
                <p className="text-sm text-muted-foreground">Available</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card/95 backdrop-blur-sm rounded-lg p-6 border border-accent/20 shadow-elegant">
            <div className="flex items-center gap-3">
              <div className="bg-accent/20 p-3 rounded-lg">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{borrowedBooks}</p>
                <p className="text-sm text-muted-foreground">Borrowed</p>
              </div>
            </div>
          </div>
        </div>

          {/* Add Book Button (Admin Only) */}
          {user.isAdmin && (
            <div className="mb-6">
              <AddBookForm onAddBook={handleAddBook} />
            </div>
          )}

          {/* Books Grid */}
          {filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  isAdmin={user.isAdmin}
                  currentUser={user}
                  onEdit={handleEditBook}
                  onDelete={handleDeleteBook}
                  onImageUpload={handleImageUpload}
                  onRequestBook={handleRequestBook}
                  onReturnBook={handleReturnBook}
                  onApproveRequest={handleApproveRequest}
                  onApproveReturn={handleApproveReturn}
                />
              ))}
            </div>
          ) : (
            <div className="bg-card/95 backdrop-blur-sm rounded-lg p-12 border border-accent/20 shadow-elegant text-center">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                No books found
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedCategory !== "All Categories" 
                  ? "Try adjusting your search or filter criteria."
                  : "The library is empty. Add some books to get started!"
                }
              </p>
              {user.isAdmin && (
                <AddBookForm onAddBook={handleAddBook} />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
