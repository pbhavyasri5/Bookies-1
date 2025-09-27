import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Library, Settings, UserCheck, LogOut } from "lucide-react";
import { LoginForm } from "@/components/LoginForm";
import { SignUpForm } from "@/components/SignUpForm";
import { SearchBar } from "@/components/SearchBar";

interface LibraryHeaderProps {
  user: { email: string; isAdmin: boolean } | null;
  onLogin: (email: string, isAdmin: boolean) => void;
  onSignUp: (email: string, isAdmin: boolean) => void;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function LibraryHeader({ user, onLogin, onSignUp, onLogout, searchQuery, onSearchChange }: LibraryHeaderProps) {
  return (
    <header className="bg-gradient-paper border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-library p-2 rounded-lg shadow-book">
              <Library className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Free Library System
              </h1>
              <p className="text-sm text-muted-foreground">
                Community Book Management
              </p>
            </div>
          </div>
          
          <div className="flex-1 max-w-md mx-8">
            <SearchBar 
              value={searchQuery} 
              onChange={onSearchChange}
            />
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {user.email}
                  </p>
                  <Badge 
                    variant={user.isAdmin ? "default" : "secondary"}
                    className="text-xs font-medium"
                  >
                    {user.isAdmin ? (
                      <>
                        <Settings className="h-3 w-3 mr-1" />
                        Admin
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-3 w-3 mr-1" />
                        User
                      </>
                    )}
                  </Badge>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onLogout}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <LoginForm onLogin={onLogin} />
                <SignUpForm onSignUp={onSignUp} />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}