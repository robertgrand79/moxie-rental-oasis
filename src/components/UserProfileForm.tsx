import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Phone, Shield, Eye, EyeOff } from 'lucide-react';
import PasswordStrengthIndicator from '@/components/auth/PasswordStrengthIndicator';
import { passwordChangeSchema, calculatePasswordStrength } from '@/utils/passwordValidation';

const UserProfileForm = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        // Set data from user metadata first
        setProfileData(prev => ({
          ...prev,
          email: user.email || '',
          fullName: user.user_metadata?.full_name || '',
          phone: user.user_metadata?.phone || ''
        }));

        // Also fetch from profiles table to get the most up-to-date phone
        const { data: profile } = await supabase
          .from('profiles')
          .select('phone, full_name')
          .eq('id', user.id)
          .single();

        if (profile) {
          setProfileData(prev => ({
            ...prev,
            phone: profile.phone || prev.phone || '',
            fullName: profile.full_name || prev.fullName || ''
          }));
        }
      }
    };

    fetchProfile();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          full_name: profileData.fullName,
          phone: profileData.phone || null
        }
      });

      if (updateError) {
        toast({
          title: 'Update Failed',
          description: updateError.message,
          variant: 'destructive'
        });
        return;
      }

      // Also update the profiles table directly
      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            full_name: profileData.fullName,
            phone: profileData.phone || null
          })
          .eq('id', user.id);

        if (profileError) {
          console.warn('Failed to update profiles table:', profileError);
        }
      }

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });

    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate with zod schema
    const validation = passwordChangeSchema.safeParse({
      currentPassword: profileData.currentPassword,
      newPassword: profileData.newPassword,
      confirmPassword: profileData.confirmPassword,
    });

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({
        title: 'Validation Error',
        description: firstError.message,
        variant: 'destructive'
      });
      return;
    }

    // Check password strength
    const strength = calculatePasswordStrength(profileData.newPassword);
    if (strength.score < 2) {
      toast({
        title: 'Weak Password',
        description: 'Please choose a stronger password with uppercase, lowercase, and numbers.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      // First verify current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: profileData.currentPassword,
      });

      if (verifyError) {
        toast({
          title: 'Verification Failed',
          description: 'Current password is incorrect. Please try again.',
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }

      // Now update the password
      const { error } = await supabase.auth.updateUser({
        password: profileData.newPassword
      });

      if (error) {
        toast({
          title: 'Password Update Failed',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Password Updated',
        description: 'Your password has been successfully updated.',
      });

      setProfileData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your account information and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                disabled
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground">
                Contact support to change your email address
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={profileData.fullName}
                onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={profileData.phone}
                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">Used for SMS notifications</p>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password to keep your account secure. You must enter your current password for verification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={profileData.currentPassword}
                  onChange={(e) => setProfileData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  disabled={isLoading}
                  placeholder="Enter your current password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={profileData.newPassword}
                  onChange={(e) => setProfileData(prev => ({ ...prev, newPassword: e.target.value }))}
                  disabled={isLoading}
                  placeholder="Enter new password"
                  minLength={8}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <PasswordStrengthIndicator password={profileData.newPassword} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={profileData.confirmPassword}
                onChange={(e) => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                disabled={isLoading}
                placeholder="Confirm new password"
                minLength={8}
              />
              {profileData.confirmPassword && profileData.newPassword !== profileData.confirmPassword && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={
                isLoading || 
                !profileData.currentPassword || 
                !profileData.newPassword || 
                !profileData.confirmPassword ||
                profileData.newPassword !== profileData.confirmPassword
              }
            >
              {isLoading ? 'Updating...' : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfileForm;