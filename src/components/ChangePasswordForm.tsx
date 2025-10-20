import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Key, Loader2 } from 'lucide-react';

interface ChangePasswordFormProps {
  userEmail: string;
}

export function ChangePasswordForm({ userEmail }: ChangePasswordFormProps) {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const { toast } = useToast();
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus management - focus modal when opened
  useEffect(() => {
    if (open && modalRef.current) {
      const firstInput = modalRef.current.querySelector('input');
      if (firstInput) {
        setTimeout(() => (firstInput as HTMLInputElement).focus(), 100);
      }
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setCurrentPasswordError('');
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Validation Error',
        description: 'New password must be at least 6 characters',
        variant: 'destructive'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'New password and confirm password do not match',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.user.changePassword({
        email: userEmail,
        currentPassword,
        newPassword
      });
      
      toast({
        title: 'Success',
        description: response.data?.message || 'Password updated successfully',
        className: 'bg-green-50 border-green-200'
      });
      
      // Clear form and close dialog
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setOpen(false);
      
    } catch (error: unknown) {
      // Always log to console for debugging
      console.error('Change password error:', error);

      let errorMessage = 'Server error, please try again later';
      let showInField = false;

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { 
            status?: number; 
            data?: { message?: string } 
          };
        };

        const status = axiosError.response?.status;
        const serverMessage = axiosError.response?.data?.message;

        // Map status codes to clear messages
        if (status === 401) {
          // Incorrect current password - show under field
          errorMessage = serverMessage || 'Incorrect current password';
          setCurrentPasswordError(errorMessage);
          showInField = true;
        } else if (status === 404) {
          errorMessage = serverMessage || 'User not found. Please login again.';
        } else if (status === 400) {
          errorMessage = serverMessage || 'New password must be at least 6 characters';
        } else if (status === 500) {
          errorMessage = serverMessage || 'Server error, please try again later';
        } else if (serverMessage) {
          errorMessage = serverMessage;
        }
      } else if (error && typeof error === 'object' && 'message' in error) {
        // Network error
        console.error('Network error:', (error as Error).message);
        errorMessage = 'Server error, please try again later';
      }

      // Show toast for all errors except 401 (which shows under field)
      if (!showInField) {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Clear form when dialog closes
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setCurrentPasswordError('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          style={{
            backgroundColor: '#ffffff',
            color: '#0b63d6',
            border: '1px solid #e5e7eb',
            fontWeight: '500'
          }}
          className="hover:bg-white hover:text-blue-700"
          aria-label="Change Password"
        >
          <Key className="h-4 w-4 mr-2" />
          Change Password
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-[425px]" 
        ref={modalRef}
        aria-describedby="change-password-description"
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-accent" />
              Change Password
            </DialogTitle>
            <DialogDescription id="change-password-description">
              Enter your current password and choose a new one. Password must be at least 6 characters.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    setCurrentPasswordError(''); // Clear error on input
                  }}
                  required
                  disabled={isSubmitting}
                  className="pr-10"
                  aria-label="Current password"
                  aria-invalid={!!currentPasswordError}
                  aria-describedby={currentPasswordError ? "current-password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                  tabIndex={-1}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {currentPasswordError && (
                <p id="current-password-error" className="text-sm text-red-600" role="alert">
                  {currentPasswordError}
                </p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password (min 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={isSubmitting}
                  className="pr-10"
                  aria-label="New password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                  tabIndex={-1}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-new-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="pr-10"
                  aria-label="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}