import { useState, useMemo, useEffect } from "react";
import { LibraryHeader } from "@/components/LibraryHeader";
import { SearchBar } from "@/components/SearchBar";
import { SidebarNav } from "@/components/SidebarNav";
import { BookCard } from "@/components/BookCard";
import { AddBookForm } from "@/components/AddBookForm";
import { EditBookForm } from "@/components/EditBookForm";
import { AuthPage } from "@/components/AuthPage";
import { AdminDashboard } from "@/components/AdminDashboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sampleBooks } from "@/data/sampleBooks";
import { Book } from "@/types/book";
import { BookOpen, Users, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import bookRequestService, { BookRequestResponse } from "@/services/bookRequestService";

const Index = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [user, setUser] = useState<{ email: string; isAdmin: boolean } | null>(null);
  const [pendingRequests, setPendingRequests] = useState<BookRequestResponse[]>([]);
  const [bookRequestMap, setBookRequestMap] = useState<Map<number, number>>(new Map());  // Changed to number keys
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const { toast } = useToast();

  const loadBooks = async () => {
    try {
      setIsLoadingBooks(true);
      const response = await api.books.getAll();
      
      // IDs are already numbers from backend - no conversion needed
      setBooks(response.data);
      console.log(`✅ Successfully loaded ${response.data.length} books from backend`);
      
      // Only show info if database is empty (not an error)
      if (response.data.length === 0) {
        console.info("ℹ️ Database is empty. Add books using the 'Add Book' button.");
      }
    } catch (error) {
      console.error("❌ Failed to load books from backend:", error);
      
      // Only use sample books if backend is completely unreachable
      // Don't show popup - just log the error
      setBooks([]);
      
      // Optional: Show a more subtle notification
      toast({
        title: "Connection Issue",
        description: "Unable to connect to backend. Please check if the server is running.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingBooks(false);
    }
  };

  // Load pending requests for admin
  const loadPendingRequests = async () => {
    if (!user?.isAdmin) return;
    
    try {
      const requests = await bookRequestService.getPendingRequests();
      setPendingRequests(requests);
      
      // Create a map of bookId to requestId for quick lookup
      const requestMap = new Map<number, number>();  // Changed to number keys
      requests.forEach(req => {
        requestMap.set(req.bookId, req.id);  // No toString() needed
      });
      setBookRequestMap(requestMap);
      
      console.log(`✅ Loaded ${requests.length} pending requests`);
    } catch (error) {
      console.error("Failed to load pending requests:", error);
    }
  };

  // Load books from backend when user logs in
  useEffect(() => {
    if (user) {
      loadBooks();
      if (user.isAdmin) {
        loadPendingRequests();
      }
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleEditClick = (book: Book) => {
    setEditingBook(book);
  };

  const handleEditBook = (updatedBook: Book) => {
    // No need for ID conversion - already a number
    setBooks(prev => prev.map(book => 
      book.id === updatedBook.id ? updatedBook : book
    ));
    setEditingBook(null);
    
    console.log(`✅ Book updated successfully: ${updatedBook.title}`);
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
    // Only allow admins to upload images
    if (!user?.isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only admins can change book images.",
        variant: "destructive",
      });
      return;
    }

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

  const handleRequestBook = async (book: Book) => {
    if (!user) return;
    
    try {
      // Create request in backend
      await bookRequestService.createRequest({
        bookId: book.id,  // No need for parseInt - id is already a number
        userEmail: user.email,
        requestType: 'BORROW',
      });

      // Update book status to pending request locally
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
      
      // Refresh pending requests if admin
      if (user.isAdmin) {
        await loadPendingRequests();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to submit request";
      toast({
        title: "Request Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleReturnBook = async (book: Book) => {
    if (!user) return;
    
    try {
      // Create return request in backend
      await bookRequestService.createRequest({
        bookId: book.id,  // No need for parseInt - id is already a number
        userEmail: user.email,
        requestType: 'RETURN',
      });

      // Update book status to pending return locally
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
      
      // Refresh pending requests if admin
      if (user.isAdmin) {
        await loadPendingRequests();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to submit return request";
      toast({
        title: "Return Request Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleApproveRequest = async (book: Book, approve: boolean) => {
    if (!user?.isAdmin) return;
    
    // Get the request ID for this book
    const requestId = bookRequestMap.get(book.id);
    if (!requestId) {
      toast({
        title: "Error",
        description: "Request ID not found",
        variant: "destructive",
      });
      return;
    }

    try {
      if (approve) {
        // Call backend approve endpoint
        const response = await bookRequestService.approveRequest(requestId, user.email);
        
        // Update local state with backend response
        if (response.book) {
          setBooks(prev => prev.map(b => 
            b.id === book.id ? {
              ...b,
              status: response.book.status as 'available' | 'borrowed' | 'pending_request' | 'pending_return',
              borrowedBy: response.book.borrowedBy,
              borrowedDate: response.book.borrowedDate,
              requestedBy: undefined,
              requestDate: undefined,
              approvalStatus: undefined
            } : b
          ));
        }

        toast({
          title: "Request Approved",
          description: `The request for "${book.title}" has been approved.`,
        });
      } else {
        // Call backend reject endpoint
        await bookRequestService.rejectRequest(requestId, user.email, "Request rejected by admin");
        
        // Update local state
        setBooks(prev => prev.map(b => 
          b.id === book.id ? {
            ...b,
            status: 'available',
            requestedBy: undefined,
            requestDate: undefined,
            approvalStatus: undefined
          } : b
        ));

        toast({
          title: "Request Rejected",
          description: `The request for "${book.title}" has been rejected.`,
          variant: "destructive",
        });
      }

      // Refresh books and pending requests from backend
      await Promise.all([
        loadBooks(),
        loadPendingRequests()
      ]);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to process request";
      toast({
        title: approve ? "Approval Failed" : "Rejection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleApproveReturn = async (book: Book, approve: boolean) => {
    if (!user?.isAdmin) return;
    
    // Get the request ID for this book
    const requestId = bookRequestMap.get(book.id);
    if (!requestId) {
      toast({
        title: "Error",
        description: "Request ID not found",
        variant: "destructive",
      });
      return;
    }

    try {
      if (approve) {
        // Call backend approve endpoint
        const response = await bookRequestService.approveRequest(requestId, user.email);
        
        // Update local state with backend response
        if (response.book) {
          setBooks(prev => prev.map(b => 
            b.id === book.id ? {
              ...b,
              status: response.book.status as 'available' | 'borrowed' | 'pending_request' | 'pending_return',
              borrowedBy: response.book.borrowedBy,
              borrowedDate: response.book.borrowedDate,
              returnRequestDate: undefined,
              approvalStatus: undefined
            } : b
          ));
        }

        toast({
          title: "Return Approved",
          description: `"${book.title}" has been successfully returned to the library.`,
        });
      } else {
        // Call backend reject endpoint
        await bookRequestService.rejectRequest(requestId, user.email, "Return rejected - please check book condition");
        
        // Update local state - keep book as borrowed
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
      }

      // Refresh books and pending requests from backend
      await Promise.all([
        loadBooks(),
        loadPendingRequests()
      ]);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to process return request";
      toast({
        title: approve ? "Approval Failed" : "Rejection Failed",
        description: errorMessage,
        variant: "destructive",
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
            onReturnBook={handleReturnBook}
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

          {/* Admin Dashboard - Pending Requests */}
          {user.isAdmin && (
            <div className="mb-8">
              <AdminDashboard 
                userEmail={user.email} 
                onRequestProcessed={loadBooks}
              />
            </div>
          )}

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
                  onEdit={handleEditClick}
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

      {/* Edit Book Dialog */}
      <EditBookForm
        book={editingBook}
        open={editingBook !== null}
        onClose={() => setEditingBook(null)}
        onBookUpdated={handleEditBook}
      />
    </div>
  );
};

export default Index;
