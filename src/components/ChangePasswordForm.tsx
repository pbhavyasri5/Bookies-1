import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

interface ChangePasswordFormProps {
  open: boolean;
  onClose: () => void;
  email: string;
}

export function ChangePasswordForm({ open, onClose, email }: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const { toast } = useToast();

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (!/\d/.test(password)) {
      return 'Password must contain at least one number';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({});
    
    // Validate new password
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setErrors(prev => ({ ...prev, newPassword: passwordError }));
      return;
    }

    // Validate confirm password
    if (newPassword !== confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      return;
    }

    // Validate against current password
    if (newPassword === currentPassword) {
      setErrors(prev => ({ ...prev, newPassword: 'New password must be different from current password' }));
      return;
    }

    setIsSubmitting(true);
    try {
      await api.user.changePassword({
        email,
        currentPassword,
        newPassword
      });
      
      toast({
        title: 'Success',
        description: 'Password successfully changed'
      });
      
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to change password. Please check your current password.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const PasswordInput = ({ 
    id, 
    label, 
    value, 
    onChange, 
    show, 
    onToggleShow,
    error
  }: { 
    id: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    show: boolean;
    onToggleShow: () => void;
    error?: string;
  }) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          required
          className={error ? "border-red-500 pr-10" : "pr-10"}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
          onClick={onToggleShow}
        >
          {show ? 
            <EyeOff className="h-4 w-4 text-muted-foreground" /> : 
            <Eye className="h-4 w-4 text-muted-foreground" />
          }
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <PasswordInput
            id="currentPassword"
            label="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            show={showCurrentPassword}
            onToggleShow={() => setShowCurrentPassword(prev => !prev)}
          />
          
          <PasswordInput
            id="newPassword"
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            show={showNewPassword}
            onToggleShow={() => setShowNewPassword(prev => !prev)}
            error={errors.newPassword}
          />
          
          <PasswordInput
            id="confirmPassword"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            show={showConfirmPassword}
            onToggleShow={() => setShowConfirmPassword(prev => !prev)}
            error={errors.confirmPassword}
          />
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Changing...' : 'Change Password'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}