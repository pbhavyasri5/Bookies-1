import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { User, Lock, Loader2 } from "lucide-react";
import { api } from "@/services/api";

interface LoginFormProps {
  onLogin: (email: string, isAdmin: boolean) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    setIsLoading(true);

    try {
      // Send POST request to backend authentication API
      const response = await api.auth.login({ email, password });
      
      // Store user data in localStorage
      const userData = {
        email: response.data.email,
        role: response.data.role,
        token: response.data.token,
        id: response.data.id,
        name: response.data.name
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', response.data.token);
      
      // Check if user is admin
      const isAdmin = response.data.role === 'ADMIN';
      
      // Call onLogin callback
      onLogin(response.data.email, isAdmin);
      
      // Close dialog and reset form
      setOpen(false);
      setEmail("");
      setPassword("");
      
      console.log("Login successful:", userData);
      
    } catch (error) {
      console.error("Login error:", error);
      
      // Check if it's an axios error with response
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status: number; data?: { message?: string } } };
        
        // Check for authentication errors (401 Unauthorized)
        if (axiosError.response?.status === 401) {
          alert("Invalid email or password");
        }
        // Other server errors
        else if (axiosError.response) {
          alert(axiosError.response.data?.message || "Login failed. Please try again.");
        }
        // Network error (server not reachable)
        else {
          alert("Server not reachable. Please try again later.");
        }
      } else {
        // Unknown error
        alert("Server not reachable. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-foreground hover:text-primary">
          Login
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-card-foreground text-center">Welcome Back</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              variant="admin" 
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}