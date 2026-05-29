import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Phone,
  Sparkles,
  LogOut,
  Bell,
  CheckCircle,
  Loader2,
  Edit2,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
}

interface GuestProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  profile_image_url: string | null;
  loyalty_points: number;
  notification_settings: NotificationSettings | null;
}

const MobileProfile: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Edit states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Fetch guest profile
  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['mobile-profile-data', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('guest_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      const defaultSettings: NotificationSettings = { email: true, sms: true, push: false };
      
      return {
        ...data,
        notification_settings: data?.notification_settings || defaultSettings
      } as GuestProfile;
    },
    enabled: !!user,
  });

  const handleOpenEdit = () => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setPhone(profile.phone || '');
      setImageUrl(profile.profile_image_url || '');
      setIsEditOpen(true);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    setUpdatingProfile(true);
    try {
      const { error } = await supabase
        .from('guest_profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          profile_image_url: imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Update Auth Metadata if first_name exists
      await supabase.auth.updateUser({
        data: { first_name: firstName, last_name: lastName }
      });

      toast.success('Profile updated successfully.');
      setIsEditOpen(false);
      refetch();
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleNotificationChange = async (key: keyof NotificationSettings, checked: boolean) => {
    if (!user || !profile) return;

    const currentSettings = profile.notification_settings || { email: true, sms: true, push: false };
    const updatedSettings = {
      ...currentSettings,
      [key]: checked
    };

    try {
      const { error } = await supabase
        .from('guest_profiles')
        .update({
          notification_settings: updatedSettings,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;
      refetch();
      toast.success('Notification preferences updated.');
    } catch (err) {
      console.error('Error updating notifications:', err);
      toast.error('Failed to update preferences.');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (isLoading) {
    return (
      <div className="flex-grow flex flex-col justify-center items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-xs text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="flex-grow p-4 space-y-6 overflow-y-auto">
      {/* Header Info Banner */}
      <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm relative">
        <Avatar className="h-16 w-16 border-2 border-slate-100 dark:border-zinc-800 shadow-sm">
          <AvatarImage src={profile?.profile_image_url || undefined} />
          <AvatarFallback className="bg-indigo-600 text-white font-extrabold text-lg">
            {profile?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 overflow-hidden space-y-0.5">
          <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100">
            {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : 'Moxie Guest'}
          </h3>
          <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
          {profile?.phone && <p className="text-[11px] text-slate-500">{profile.phone}</p>}
        </div>

        <Button
          onClick={handleOpenEdit}
          size="icon"
          variant="outline"
          className="absolute top-4 right-4 h-8 w-8 rounded-full border-slate-200"
        >
          <Edit2 className="h-3.5 w-3.5 text-slate-600" />
        </Button>
      </div>

      {/* Loyalty Status Card */}
      <Card className="rounded-3xl border-0 shadow-sm bg-gradient-to-br from-violet-600 to-indigo-700 text-white p-5 space-y-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] text-violet-200 uppercase tracking-widest font-bold">Loyalty Rewards</span>
            <CardTitle className="font-black text-lg">Moxie Oasis Club</CardTitle>
          </div>
          <Badge className="bg-white/20 text-white text-[10px] uppercase font-extrabold tracking-wider border-0">
            Gold Member
          </Badge>
        </div>
        <div className="flex justify-between items-end pt-2">
          <div className="space-y-0.5">
            <span className="text-[10px] text-violet-200">Total Points Balance</span>
            <p className="text-2xl font-black">{profile?.loyalty_points || 0} pts</p>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-amber-300 font-bold bg-white/10 px-2.5 py-1 rounded-full">
            <Sparkles className="h-3 w-3 fill-amber-300" />
            10% booking discount unlocked
          </div>
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card className="rounded-3xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-extrabold flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <Bell className="h-4 w-4 text-indigo-600" />
            Notifications
          </CardTitle>
          <CardDescription className="text-xs">Manage how we message you during your stay</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-1">
          <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-zinc-800/50">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Notifications</span>
              <p className="text-[10px] text-muted-foreground">Booking receipts, checklists, check-out alerts</p>
            </div>
            <Switch
              checked={profile?.notification_settings?.email ?? true}
              onCheckedChange={(checked) => handleNotificationChange('email', checked)}
            />
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-zinc-800/50">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">SMS / Text Alerts</span>
              <p className="text-[10px] text-muted-foreground">Gate codes, door access changes, host text alerts</p>
            </div>
            <Switch
              checked={profile?.notification_settings?.sms ?? true}
              onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">App Push Notifications</span>
              <p className="text-[10px] text-muted-foreground">Host chats, local recommendations, housekeeping ready</p>
            </div>
            <Switch
              checked={profile?.notification_settings?.push ?? false}
              onCheckedChange={(checked) => handleNotificationChange('push', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Settings Menu */}
      <div className="space-y-2">
        <Button
          variant="outline"
          onClick={handleSignOut}
          className="w-full justify-start gap-3 rounded-2xl h-12 border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50/50 dark:border-red-950/20 dark:hover:bg-red-950/10 font-bold"
        >
          <LogOut className="h-5 w-5" />
          Log Out
        </Button>
      </div>

      {/* The Drawer Rule Slide-Out Form */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent side="right" className="w-[100vw] sm:max-w-md p-0 flex flex-col h-full bg-white dark:bg-zinc-900 shadow-2xl">
          {/* Fixed Header */}
          <SheetHeader className="p-5 border-b text-left flex-shrink-0">
            <SheetTitle className="font-black text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-600" />
              Edit Profile Details
            </SheetTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Keep your travel contact info up to date</p>
          </SheetHeader>

          {/* Scrollable Form Body */}
          <form onSubmit={handleUpdateProfile} className="flex-grow overflow-y-auto p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  First Name
                </label>
                <Input
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Maddie"
                  className="rounded-xl border-slate-200 focus-visible:ring-indigo-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Last Name
                </label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Grand"
                  className="rounded-xl border-slate-200 focus-visible:ring-indigo-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Phone Number
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +1 541-255-1698"
                className="rounded-xl border-slate-200 focus-visible:ring-indigo-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Profile Image URL
              </label>
              <Input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="rounded-xl border-slate-200 focus-visible:ring-indigo-600"
              />
            </div>

            {/* Native submission trigger */}
            <button type="submit" className="hidden" id="mobile-profile-submit-btn" />
          </form>

          {/* Fixed Footer */}
          <SheetFooter className="p-4 border-t flex flex-row items-center gap-2 justify-end bg-slate-50/80 dark:bg-zinc-900/80 backdrop-blur-sm flex-shrink-0">
            <SheetClose asChild>
              <Button
                variant="outline"
                className="rounded-xl border-slate-200 hover:bg-slate-100 dark:border-zinc-800 dark:hover:bg-zinc-800 flex-1 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </Button>
            </SheetClose>
            <Button
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 flex-1"
              disabled={updatingProfile}
              onClick={() => document.getElementById('mobile-profile-submit-btn')?.click()}
            >
              {updatingProfile ? 'Saving...' : 'Save Profile'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileProfile;
