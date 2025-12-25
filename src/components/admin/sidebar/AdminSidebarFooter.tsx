import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { User, LogOut, Edit2, Save, X, ChevronDown } from 'lucide-react';
import { SidebarFooter, useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';

const AdminSidebarFooter = () => {
  const { user, signOut, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editData, setEditData] = useState({
    full_name: profile?.full_name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
  });

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form data when canceling
      setEditData({
        full_name: profile?.full_name || '',
        email: user?.email || '',
        phone: profile?.phone || '',
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
          phone: editData.phone || null,
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
      // Clear all React Query cache before signout to prevent stale data
      queryClient.clear();
      
      const { error } = await signOut();
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to sign out. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      
      // Redirect to sign-in page - use full reload to clear all state
      navigate('/auth', { replace: true });
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

  // When collapsed, show just the avatar with tooltip
  if (isCollapsed) {
    return (
      <SidebarFooter>
        <div className="border-t border-gray-200 p-2 flex justify-center">
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 p-0"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || ''} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {getInitials(profile?.full_name || user.email || 'U')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="right">
                {profile?.full_name || 'Profile'}
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="start" side="right" className="w-48 mb-2">
              <DropdownMenuItem onClick={handleEditToggle} className="cursor-pointer">
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    );
  }

  return (
    <SidebarFooter>
      <div className="border-t border-border p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center gap-3 w-full justify-start p-0 h-auto hover:bg-transparent"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {getInitials(profile?.full_name || user.email || 'U')}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2 flex-1 justify-between">
                <span className="font-medium text-foreground truncate">
                  {profile?.full_name || 'No name set'}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 mb-2">
            <DropdownMenuItem onClick={handleEditToggle} className="cursor-pointer">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Edit Profile
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {getInitials(profile?.full_name || user?.email || 'U')}
                </AvatarFallback>
              </Avatar>
            </div>
            
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
              <div>
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
                <p className="text-xs text-muted-foreground mt-1">Used for SMS notifications</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
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
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarFooter>
  );
};

export default AdminSidebarFooter;
