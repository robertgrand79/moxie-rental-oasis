import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Plus, Bell, ArrowLeft, Activity, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const PlatformToolbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  // Determine if we're on the main dashboard
  const isDashboard = location.pathname === '/admin/platform';

  // Mock notification count - in real implementation, fetch from backend
  const notificationCount = 3;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to lookup with search query
      navigate(`/admin/platform/lookup?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleBackClick = () => {
    if (isDashboard) {
      navigate('/admin');
    } else {
      navigate('/admin/platform');
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 gap-4">
        {/* Left section - Title and Back button */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackClick}
            className="gap-2"
          >
            {isDashboard ? (
              <>
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Admin</span>
              </>
            ) : (
              <>
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </>
            )}
          </Button>
          <div className="hidden md:block h-6 w-px bg-border" />
          <h1 className="hidden md:block font-semibold text-lg">
            Platform Command Center
          </h1>
        </div>

        {/* Center section - Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search organizations, users, tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted/50 border-transparent focus:border-border"
            />
          </div>
        </form>

        {/* Right section - Actions */}
        <div className="flex items-center gap-2">
          {/* System Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Activity className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">All Systems OK</span>
          </div>

          {/* Quick Create */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate('/admin/platform/organizations?action=create')}>
                New Organization
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/admin/platform/templates?action=create')}>
                New Template
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/admin/platform/help-center?action=create')}>
                New Help Article
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            {notificationCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center text-xs"
                variant="destructive"
              >
                {notificationCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default PlatformToolbar;
