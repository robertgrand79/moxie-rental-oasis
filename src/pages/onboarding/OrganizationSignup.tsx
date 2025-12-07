import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useCreateOrganization } from '@/hooks/useOnboarding';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Loader2, CheckCircle2, XCircle } from 'lucide-react';

const OrganizationSignup = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { organization, loading: orgLoading } = useCurrentOrganization();
  const { createOrganization, checkSlugAvailability, creating } = useCreateOrganization();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  // Redirect if already has organization
  useEffect(() => {
    if (!authLoading && !orgLoading && organization) {
      navigate('/admin/onboarding');
    }
  }, [organization, authLoading, orgLoading, navigate]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?redirect=/signup');
    }
  }, [user, authLoading, navigate]);

  // Auto-generate slug from name
  useEffect(() => {
    const generatedSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 30);
    setSlug(generatedSlug);
  }, [name]);

  // Check slug availability with debounce
  useEffect(() => {
    if (!slug || slug.length < 3) {
      setSlugStatus('idle');
      return;
    }

    setSlugStatus('checking');
    const timer = setTimeout(async () => {
      const available = await checkSlugAvailability(slug);
      setSlugStatus(available ? 'available' : 'taken');
    }, 500);

    return () => clearTimeout(timer);
  }, [slug, checkSlugAvailability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug || slugStatus !== 'available') return;

    const orgId = await createOrganization({ name, slug });
    if (orgId) {
      navigate('/admin/onboarding');
    }
  };

  if (authLoading || orgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Create Your Organization</CardTitle>
          <CardDescription>
            Set up your vacation rental management account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                placeholder="My Vacation Rentals"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <div className="relative">
                <Input
                  id="slug"
                  placeholder="my-rentals"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  required
                  minLength={3}
                  maxLength={30}
                  className="pr-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {slugStatus === 'checking' && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  {slugStatus === 'available' && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                  {slugStatus === 'taken' && (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Your site will be available at: <span className="font-mono">{slug || 'your-slug'}.lovable.app</span>
              </p>
              {slugStatus === 'taken' && (
                <p className="text-xs text-destructive">This slug is already taken</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={creating || !name || !slug || slugStatus !== 'available'}
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Organization'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationSignup;
