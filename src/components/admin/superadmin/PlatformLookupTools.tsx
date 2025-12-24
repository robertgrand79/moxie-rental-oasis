import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Globe, 
  Mail, 
  Calendar, 
  Building2, 
  Home,
  User,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';

const PlatformLookupTools = () => {
  const [domainSearch, setDomainSearch] = useState('');
  const [emailSearch, setEmailSearch] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');
  
  const [domainResult, setDomainResult] = useState<any>(null);
  const [emailResult, setEmailResult] = useState<any>(null);
  const [bookingResult, setBookingResult] = useState<any>(null);

  // Domain lookup
  const domainLookup = useMutation({
    mutationFn: async (domain: string) => {
      const { data, error } = await supabase
        .from('organizations')
        .select(`
          id, name, slug, custom_domain, is_active, created_at,
          subscription_status, subscription_tier
        `)
        .or(`custom_domain.eq.${domain},slug.eq.${domain}`)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => setDomainResult(data),
  });

  // Email lookup
  const emailLookup = useMutation({
    mutationFn: async (email: string) => {
      // First check profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id, email, full_name, role, organization_id, last_login_at
        `)
        .eq('email', email.toLowerCase())
        .maybeSingle();
      
      if (profile) {
        // Get organization if exists
        let org = null;
        if (profile.organization_id) {
          const { data } = await supabase
            .from('organizations')
            .select('id, name, slug')
            .eq('id', profile.organization_id)
            .single();
          org = data;
        }
        return { type: 'user', profile, organization: org };
      }

      // Check guest reservations
      const { data: reservation } = await supabase
        .from('property_reservations')
        .select(`
          id, guest_name, guest_email, property_id, check_in_date, check_out_date,
          booking_status, created_at,
          properties:property_id (title, organization_id)
        `)
        .eq('guest_email', email.toLowerCase())
        .order('created_at', { ascending: false })
        .limit(5);

      if (reservation && reservation.length > 0) {
        return { type: 'guest', reservations: reservation };
      }

      return null;
    },
    onSuccess: (data) => setEmailResult(data),
  });

  // Booking confirmation lookup
  const bookingLookup = useMutation({
    mutationFn: async (confirmationId: string) => {
      // Search by ID or stripe session
      const { data, error } = await supabase
        .from('property_reservations')
        .select(`
          *,
          properties:property_id (
            id, title, organization_id,
            organizations:organization_id (id, name, slug)
          )
        `)
        .or(`id.eq.${confirmationId},stripe_session_id.eq.${confirmationId}`)
        .maybeSingle();
      
      if (error && !error.message.includes('invalid input syntax')) throw error;
      return data;
    },
    onSuccess: (data) => setBookingResult(data),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Platform Lookup Tools
        </CardTitle>
        <CardDescription>
          Find tenants, users, and bookings across the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="domain" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="domain" className="flex-1">
              <Globe className="h-4 w-4 mr-2" />
              Domain/Slug
            </TabsTrigger>
            <TabsTrigger value="email" className="flex-1">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="booking" className="flex-1">
              <Calendar className="h-4 w-4 mr-2" />
              Booking
            </TabsTrigger>
          </TabsList>

          {/* Domain Lookup */}
          <TabsContent value="domain" className="mt-4 space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter domain or slug (e.g., mysite.staymoxie.com or my-org)"
                value={domainSearch}
                onChange={(e) => setDomainSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && domainLookup.mutate(domainSearch)}
              />
              <Button 
                onClick={() => domainLookup.mutate(domainSearch)}
                disabled={domainLookup.isPending || !domainSearch}
              >
                {domainLookup.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {domainResult === null && domainLookup.isSuccess && (
              <div className="p-4 bg-muted rounded-lg text-center">
                <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p>No organization found for this domain/slug</p>
              </div>
            )}
            
            {domainResult && (
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <Building2 className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold text-lg">{domainResult.name}</h3>
                    <p className="text-sm text-muted-foreground">/{domainResult.slug}</p>
                  </div>
                  <Badge variant={domainResult.is_active ? 'default' : 'destructive'}>
                    {domainResult.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Subscription:</span>
                    <span className="ml-2">{domainResult.subscription_status || 'None'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created:</span>
                    <span className="ml-2">{format(new Date(domainResult.created_at), 'MMM d, yyyy')}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={`/${domainResult.slug}`} target="_blank" rel="noopener">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Visit Site
                  </a>
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Email Lookup */}
          <TabsContent value="email" className="mt-4 space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address"
                type="email"
                value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && emailLookup.mutate(emailSearch)}
              />
              <Button 
                onClick={() => emailLookup.mutate(emailSearch)}
                disabled={emailLookup.isPending || !emailSearch}
              >
                {emailLookup.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {emailResult === null && emailLookup.isSuccess && (
              <div className="p-4 bg-muted rounded-lg text-center">
                <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p>No user or guest found with this email</p>
              </div>
            )}
            
            {emailResult?.type === 'user' && (
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold text-lg">{emailResult.profile.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{emailResult.profile.email}</p>
                  </div>
                  <Badge>{emailResult.profile.role}</Badge>
                </div>
                {emailResult.organization && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Organization:</span>
                    <span className="ml-2">{emailResult.organization.name}</span>
                  </div>
                )}
                <div className="text-sm">
                  <span className="text-muted-foreground">Last Login:</span>
                  <span className="ml-2">
                    {emailResult.profile.last_login_at 
                      ? format(new Date(emailResult.profile.last_login_at), 'MMM d, yyyy h:mm a')
                      : 'Never'
                    }
                  </span>
                </div>
              </div>
            )}
            
            {emailResult?.type === 'guest' && (
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold">Guest User</h3>
                    <p className="text-sm text-muted-foreground">{emailResult.reservations[0]?.guest_email}</p>
                  </div>
                  <Badge variant="outline">Guest</Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">{emailResult.reservations.length} reservation(s) found:</p>
                  {emailResult.reservations.map((res: any) => (
                    <div key={res.id} className="text-sm p-2 bg-muted rounded flex justify-between">
                      <span>{(res.properties as any)?.title || 'Unknown Property'}</span>
                      <span>{format(new Date(res.check_in_date), 'MMM d')} - {format(new Date(res.check_out_date), 'MMM d, yyyy')}</span>
                      <Badge variant="outline">{res.booking_status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Booking Lookup */}
          <TabsContent value="booking" className="mt-4 space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter booking ID or Stripe session ID"
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && bookingLookup.mutate(bookingSearch)}
              />
              <Button 
                onClick={() => bookingLookup.mutate(bookingSearch)}
                disabled={bookingLookup.isPending || !bookingSearch}
              >
                {bookingLookup.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {bookingResult === null && bookingLookup.isSuccess && (
              <div className="p-4 bg-muted rounded-lg text-center">
                <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p>No booking found with this ID</p>
              </div>
            )}
            
            {bookingResult && (
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold">{bookingResult.guest_name}</h3>
                      <p className="text-sm text-muted-foreground">{bookingResult.guest_email}</p>
                    </div>
                  </div>
                  <Badge variant={bookingResult.booking_status === 'confirmed' ? 'default' : 'outline'}>
                    {bookingResult.booking_status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Property:</span>
                    <span className="ml-2">{(bookingResult.properties as any)?.title}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Organization:</span>
                    <span className="ml-2">{((bookingResult.properties as any)?.organizations as any)?.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Dates:</span>
                    <span className="ml-2">
                      {format(new Date(bookingResult.check_in_date), 'MMM d')} - {format(new Date(bookingResult.check_out_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="ml-2">${bookingResult.total_amount}</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                  ID: {bookingResult.id}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PlatformLookupTools;
