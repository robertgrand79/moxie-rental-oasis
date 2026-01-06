import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Users, Home, CalendarCheck, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import PlatformSectionCard from './PlatformSectionCard';
import { platformNavItems, getNavItemByKey } from './platformNavItems';
import { usePlatformPreferences } from '@/hooks/usePlatformPreferences';

const PlatformDashboard = () => {
  const { starredSections, isStarred, toggleStarSection } = usePlatformPreferences();

  // Fetch platform stats
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      const [orgsResult, usersResult, propertiesResult, reservationsResult, ticketsResult] = await Promise.all([
        supabase.from('organizations').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase.from('reservations').select('id', { count: 'exact', head: true }),
        supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open'),
      ]);

      return {
        organizations: orgsResult.count ?? 0,
        users: usersResult.count ?? 0,
        properties: propertiesResult.count ?? 0,
        reservations: reservationsResult.count ?? 0,
        openTickets: ticketsResult.count ?? 0,
      };
    },
  });

  // Get stats for specific sections
  const getSectionStats = (key: string) => {
    if (!stats) return undefined;
    
    switch (key) {
      case 'organizations':
        return { value: stats.organizations, label: 'Active organizations', trend: 'up' as const };
      case 'users':
        return { value: stats.users, label: 'Total users', trend: 'up' as const };
      case 'support':
        return { value: stats.openTickets, label: 'Open tickets', trend: stats.openTickets > 5 ? 'up' as const : 'neutral' as const };
      default:
        return undefined;
    }
  };

  // Separate starred and non-starred items
  const starredItems = platformNavItems.filter(item => isStarred(item.key));
  const nonStarredItems = platformNavItems.filter(item => !isStarred(item.key));

  const statCards = [
    { label: 'Organizations', value: stats?.organizations ?? 0, icon: Building2, color: 'text-blue-500' },
    { label: 'Users', value: stats?.users ?? 0, icon: Users, color: 'text-emerald-500' },
    { label: 'Properties', value: stats?.properties ?? 0, icon: Home, color: 'text-violet-500' },
    { label: 'Reservations', value: stats?.reservations ?? 0, icon: CalendarCheck, color: 'text-amber-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-muted ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                {loadingStats ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                )}
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Starred Sections */}
      {starredItems.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
            <h2 className="text-lg font-semibold">Starred Sections</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {starredItems.map((item) => (
              <PlatformSectionCard
                key={item.key}
                item={item}
                isStarred={true}
                onToggleStar={() => toggleStarSection(item.key)}
                stats={getSectionStats(item.key)}
              />
            ))}
          </div>
        </section>
      )}

      {/* All Sections */}
      <section>
        <h2 className="text-lg font-semibold mb-4">All Sections</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {nonStarredItems.map((item) => (
            <PlatformSectionCard
              key={item.key}
              item={item}
              isStarred={false}
              onToggleStar={() => toggleStarSection(item.key)}
              variant="compact"
            />
          ))}
        </div>
      </section>

      {/* Quick Tip */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4 flex items-center gap-3">
          <Star className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Tip:</span> Star your frequently used sections to keep them at the top of this dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformDashboard;
