import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, LogOut, Edit2, Save, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const UserProfileSection = () => {
  const { user, signOut, profile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editData, setEditData] = useState({
    full_name: profile?.full_name || '',
    email: user?.email || '',
  });

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form data when canceling
      setEditData({
        full_name: profile?.full_name || '',
        email: user?.email || '',
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Update profile information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: editData.full_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update email if it changed
      if (editData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: editData.email,
        });

        if (emailError) throw emailError;

        toast({
          title: "Profile Updated",
          description: "Your profile has been updated. Please check your email to confirm the new email address.",
        });
      } else {
        toast({
          title: "Profile Updated",
          description: "Your profile information has been successfully updated.",
        });
      }

      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) return null;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5" />
          User Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(profile?.full_name || user.email || 'U')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="full_name" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="full_name"
                    value={editData.full_name}
                    onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-foreground">
                  {profile?.full_name || 'No name set'}
                </p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  Role: {profile?.role || 'user'}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                size="sm"
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                onClick={handleEditToggle}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleEditToggle}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button
                onClick={handleSignOut}
                variant="secondary"
                size="sm"
                className="flex-1"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfileSection;