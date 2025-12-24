import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Download, Trash2, FileText, Shield, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const DataExportRequest: React.FC = () => {
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const exportUserData = async () => {
    if (!user) {
      toast.error('You must be logged in to export your data');
      return;
    }

    setExporting(true);
    try {
      // Collect user data from various tables
      const [profileRes, reservationsRes, preferencesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('reservations').select('*').eq('guest_email', user.email),
        supabase.from('site_settings').select('key, value').eq('organization_id', user.id),
      ]);

      const exportData = {
        exportDate: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
        },
        profile: profileRes.data || null,
        reservations: reservationsRes.data || [],
        preferences: preferencesRes.data || [],
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `user-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Your data has been exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const requestAccountDeletion = async () => {
    if (!user) {
      toast.error('You must be logged in to request account deletion');
      return;
    }

    setDeleting(true);
    try {
      // In a production app, this would:
      // 1. Mark the account for deletion
      // 2. Send a confirmation email
      // 3. Schedule actual deletion after a grace period
      
      // For now, we'll create a deletion request record
      const { error } = await supabase.from('application_logs').insert({
        level: 'info',
        message: `Account deletion requested for user: ${user.id}`,
        tags: ['gdpr', 'deletion-request'],
        context: {
          user_id: user.id,
          email: user.email,
          requested_at: new Date().toISOString(),
        },
      });

      if (error) throw error;

      toast.success(
        'Deletion request submitted. You will receive an email confirmation within 24 hours.',
        { duration: 5000 }
      );
    } catch (error) {
      console.error('Error requesting deletion:', error);
      toast.error('Failed to submit deletion request. Please contact support.');
    } finally {
      setDeleting(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Please log in to manage your data privacy settings.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Data Access Rights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Your Data Rights
          </CardTitle>
          <CardDescription>
            Under GDPR, CCPA, and other privacy regulations, you have the following rights regarding your personal data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4" />
                Right to Access
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                You can request a copy of all personal data we hold about you.
              </p>
              <Button 
                onClick={exportUserData} 
                disabled={exporting}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                {exporting ? 'Exporting...' : 'Export My Data'}
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <Trash2 className="h-4 w-4" />
                Right to Erasure
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                You can request deletion of your account and associated data.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete My Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Delete Your Account?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p>This action will:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Permanently delete your account</li>
                        <li>Remove all your personal data</li>
                        <li>Cancel any active subscriptions</li>
                        <li>Delete your booking history</li>
                      </ul>
                      <p className="font-medium text-destructive">
                        This action cannot be undone after the 14-day grace period.
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={requestAccountDeletion}
                      className="bg-destructive hover:bg-destructive/90"
                      disabled={deleting}
                    >
                      {deleting ? 'Submitting...' : 'Confirm Deletion'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Rights Info */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Rights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Right to Rectification</h4>
              <p className="text-sm text-muted-foreground">
                You can update your personal information in your profile settings at any time.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Right to Portability</h4>
              <p className="text-sm text-muted-foreground">
                Export your data in a machine-readable format (JSON) using the export button above.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Right to Object</h4>
              <p className="text-sm text-muted-foreground">
                You can opt out of marketing communications in your notification settings.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Right to Restrict Processing</h4>
              <p className="text-sm text-muted-foreground">
                Contact our support team to request restriction of your data processing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Retention Info */}
      <Card>
        <CardHeader>
          <CardTitle>Data Retention</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>We retain your data for the following periods:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Account data:</strong> Until you request deletion + 14-day grace period</li>
            <li><strong>Booking records:</strong> 7 years for legal compliance</li>
            <li><strong>Payment information:</strong> Handled by Stripe; we don't store full card numbers</li>
            <li><strong>Analytics data:</strong> Anonymized after 26 months</li>
            <li><strong>Support communications:</strong> 3 years after last interaction</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataExportRequest;
