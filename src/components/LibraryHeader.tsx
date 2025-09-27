import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Library, Settings, UserCheck } from "lucide-react";

interface LibraryHeaderProps {
  isAdmin: boolean;
  onToggleRole: () => void;
}

export function LibraryHeader({ isAdmin, onToggleRole }: LibraryHeaderProps) {
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
          
          <div className="flex items-center gap-4">
            <Badge 
              variant={isAdmin ? "default" : "secondary"}
              className="text-xs font-medium"
            >
              {isAdmin ? (
                <>
                  <Settings className="h-3 w-3 mr-1" />
                  Admin Mode
                </>
              ) : (
                <>
                  <UserCheck className="h-3 w-3 mr-1" />
                  User Mode
                </>
              )}
            </Badge>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onToggleRole}
              className="text-xs"
            >
              Switch to {isAdmin ? 'User' : 'Admin'}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}