import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2, CheckCircle, XCircle, Shield } from 'lucide-react';
import { z } from 'zod';

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

interface InvitationDetails {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  team_role: string;
  organization_name: string | null;
  inviter_name: string | null;
  expires_at: string;
  organization_id: string;
}

const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link. Please check your email for the correct link.');
      setLoading(false);
      return;
    }

    fetchInvitation();
  }, [token]);

  const fetchInvitation = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('user_invitations')
        .select('id, email, full_name, role, team_role, organization_name, inviter_name, expires_at, organization_id')
        .eq('invitation_token', token)
        .eq('status', 'pending')
        .single();

      if (fetchError || !data) {
        setError('This invitation is invalid or has already been used.');
        return;
      }

      // Check if expired
      if (new Date(data.expires_at) < new Date()) {
        setError('This invitation has expired. Please request a new invitation.');
        return;
      }

      setInvitation(data as InvitationDetails);
    } catch (err) {
      console.error('Error fetching invitation:', err);
      setError('Failed to load invitation details.');
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (value: string) => {
    const result = passwordSchema.safeParse(value);
    if (!result.success) {
      setPasswordErrors(result.error.errors.map(e => e.message));
      return false;
    }
    setPasswordErrors([]);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invitation) return;

    // Validate password
    if (!validatePassword(password)) {
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!acceptTerms) {
      toast.error('Please accept the Terms of Service to continue');
      return;
    }

    setSubmitting(true);

    try {
      // Create the user account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: invitation.email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
          data: {
            full_name: invitation.full_name,
          }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error('Failed to create account');
      }

      // Update the invitation status
      await supabase
        .from('user_invitations')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      // Add user to organization
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: invitation.organization_id,
          user_id: authData.user.id,
          role: invitation.role,
          team_role: invitation.team_role as any,
          invited_by: null, // Will be updated via trigger if needed
        });

      if (memberError) {
        console.error('Error adding to organization:', memberError);
        // Don't fail - the user is created
      }

      toast.success('Account created successfully! Welcome to the team.');
      
      // Redirect to dashboard
      navigate('/admin');
    } catch (err: any) {
      console.error('Error accepting invitation:', err);
      if (err.message?.includes('already registered')) {
        toast.error('An account with this email already exists. Please sign in instead.');
        navigate('/auth');
      } else {
        toast.error(err.message || 'Failed to create account');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'staff': return 'bg-green-100 text-green-800';
      case 'view_only': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatRole = (role: string) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Invitation Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/auth')} 
              className="w-full"
              variant="outline"
            >
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle>You're Invited!</CardTitle>
          <CardDescription className="space-y-2">
            <p>
              {invitation.inviter_name || 'Someone'} has invited you to join{' '}
              <strong>{invitation.organization_name || 'their organization'}</strong>
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(invitation.team_role)}`}>
                {formatRole(invitation.team_role)}
              </span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input 
                value={invitation.email} 
                disabled 
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Create Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (e.target.value) validatePassword(e.target.value);
                }}
                placeholder="Enter your password"
                required
              />
              {passwordErrors.length > 0 && (
                <ul className="text-sm text-destructive space-y-1">
                  {passwordErrors.map((error, i) => (
                    <li key={i}>• {error}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-destructive">Passwords do not match</p>
              )}
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
              />
              <label
                htmlFor="terms"
                className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I accept the{' '}
                <a href="/terms" className="text-primary hover:underline" target="_blank">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-primary hover:underline" target="_blank">
                  Privacy Policy
                </a>
              </label>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={submitting || !acceptTerms}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Accept & Create Account'
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <a href="/auth" className="text-primary hover:underline">
                Sign in
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvitation;
