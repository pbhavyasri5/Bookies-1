import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import bookRequestService, { BookRequestResponse } from '@/services/bookRequestService';
import { Clock, CheckCircle, XCircle, Book as BookIcon, User, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface AdminDashboardProps {
  userEmail: string;
  onRequestProcessed?: () => void;
}

export const AdminDashboard = ({ userEmail, onRequestProcessed }: AdminDashboardProps) => {
  const [pendingRequests, setPendingRequests] = useState<BookRequestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; request: BookRequestResponse | null }>({
    open: false,
    request: null,
  });
  const [rejectNotes, setRejectNotes] = useState('');
  const { toast } = useToast();

  const loadPendingRequests = async () => {
    try {
      setIsLoading(true);
      const requests = await bookRequestService.getPendingRequests();
      setPendingRequests(requests);
      console.log(`✅ Loaded ${requests.length} pending requests`);
    } catch (error) {
      console.error('Failed to load pending requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pending requests',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPendingRequests();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApprove = async (request: BookRequestResponse) => {
    try {
      setProcessingId(request.id);
      await bookRequestService.approveRequest(request.id, {
        adminEmail: userEmail,
        notes: 'Request approved by admin',
      });

      toast({
        title: 'Request Approved',
        description: `${request.requestType} request for "${request.bookTitle}" has been approved.`,
      });

      // Refresh the list
      await loadPendingRequests();
      
      // Notify parent component
      if (onRequestProcessed) {
        onRequestProcessed();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve request';
      toast({
        title: 'Approval Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectClick = (request: BookRequestResponse) => {
    setRejectDialog({ open: true, request });
    setRejectNotes('');
  };

  const handleRejectConfirm = async () => {
    if (!rejectDialog.request) return;

    try {
      setProcessingId(rejectDialog.request.id);
      await bookRequestService.rejectRequest(rejectDialog.request.id, {
        adminEmail: userEmail,
        notes: rejectNotes || 'Request declined by admin',
      });

      toast({
        title: 'Request Declined',
        description: `${rejectDialog.request.requestType} request for "${rejectDialog.request.bookTitle}" has been declined.`,
      });

      // Close dialog
      setRejectDialog({ open: false, request: null });
      setRejectNotes('');

      // Refresh the list
      await loadPendingRequests();
      
      // Notify parent component
      if (onRequestProcessed) {
        onRequestProcessed();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to decline request';
      toast({
        title: 'Decline Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          <span className="ml-3 text-muted-foreground">Loading pending requests...</span>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6 bg-card/95 backdrop-blur-sm border-accent/20 shadow-elegant">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="h-6 w-6 text-accent" />
          <h2 className="text-2xl font-bold text-card-foreground">Pending Book Requests</h2>
          <Badge variant="secondary" className="ml-2">
            {pendingRequests.length}
          </Badge>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              No Pending Requests
            </h3>
            <p className="text-muted-foreground">
              All book requests have been processed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <Card
                key={request.id}
                className="p-4 border-accent/20 hover:border-accent/40 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Request Details */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <BookIcon className="h-5 w-5 text-accent" />
                      <h3 className="font-semibold text-card-foreground">
                        {request.bookTitle}
                      </h3>
                      <Badge
                        variant={request.requestType === 'BORROW' ? 'default' : 'secondary'}
                        className="ml-2"
                      >
                        {request.requestType}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{request.userEmail}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(request.requestedAt)}</span>
                      </div>
                    </div>

                    {request.bookAuthor && (
                      <p className="text-sm text-muted-foreground">
                        by {request.bookAuthor}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(request)}
                      disabled={processingId === request.id}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleRejectClick(request)}
                      disabled={processingId === request.id}
                      variant="destructive"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => !open && setRejectDialog({ open, request: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Book Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to decline this {rejectDialog.request?.requestType.toLowerCase()} request for "{rejectDialog.request?.bookTitle}"?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">
              Reason (Optional)
            </label>
            <Textarea
              placeholder="Enter reason for declining this request..."
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialog({ open: false, request: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={processingId !== null}
            >
              Decline Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
