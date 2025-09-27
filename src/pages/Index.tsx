import { useState, useMemo } from "react";
import { LibraryHeader } from "@/components/LibraryHeader";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { BookCard } from "@/components/BookCard";
import { AddBookForm } from "@/components/AddBookForm";
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

  const handleEditBook = (book: Book) => {
    toast({
      title: "Edit Book",
      description: `Edit functionality for "${book.title}" would open here.`,
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

  const handleViewBook = (book: Book) => {
    toast({
      title: "Book Details",
      description: `View details for "${book.title}" by ${book.author}.`,
    });
  };

  const totalBooks = books.length;
  const availableBooks = books.filter(b => b.status === 'available').length;
  const borrowedBooks = books.filter(b => b.status === 'borrowed').length;

  const isAdmin = user?.isAdmin || false;

  return (
    <div className="min-h-screen bg-gradient-paper">
      <LibraryHeader 
        user={user}
        onLogin={handleLogin}
        onSignUp={handleSignUp}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-lg p-6 border border-border shadow-book">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{totalBooks}</p>
                <p className="text-sm text-muted-foreground">Total Books</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg p-6 border border-border shadow-book">
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
          
          <div className="bg-card rounded-lg p-6 border border-border shadow-book">
            <div className="flex items-center gap-3">
              <div className="bg-secondary/50 p-3 rounded-lg">
                <Users className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{borrowedBooks}</p>
                <p className="text-sm text-muted-foreground">Borrowed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-card rounded-lg p-6 border border-border shadow-book mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <CategoryFilter 
                value={selectedCategory} 
                onChange={setSelectedCategory}
              />
            </div>
            
            {isAdmin && user && (
              <AddBookForm onAddBook={handleAddBook} />
            )}
          </div>
          
          {filteredBooks.length > 0 && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Showing {filteredBooks.length} of {totalBooks} books
              </span>
              {selectedCategory !== "All Categories" && (
                <Badge variant="outline" className="text-xs">
                  {selectedCategory}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Books Grid */}
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isAdmin={isAdmin}
                onEdit={handleEditBook}
                onDelete={handleDeleteBook}
                onView={handleViewBook}
              />
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-lg p-12 border border-border shadow-book text-center">
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
            {isAdmin && user && (
              <AddBookForm onAddBook={handleAddBook} />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
