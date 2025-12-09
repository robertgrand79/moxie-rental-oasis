import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useCreateOrganization } from '@/hooks/useOnboarding';
import { useTemplateOrganizations, TemplateType } from '@/hooks/useTemplateOrganizations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Loader2, CheckCircle2, XCircle, Home, Building } from 'lucide-react';
import { cn } from '@/lib/utils';

const OrganizationSignup = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { organization, loading: orgLoading } = useCurrentOrganization();
  const { createOrganization, checkSlugAvailability, creating } = useCreateOrganization();
  const { data: templates, isLoading: loadingTemplates } = useTemplateOrganizations();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [selectedTemplateType, setSelectedTemplateType] = useState<TemplateType | null>(null);

  // Redirect if already has organization
  useEffect(() => {
    if (!authLoading && !orgLoading && organization?.slug) {
      window.location.href = `/admin/onboarding?org=${organization.slug}`;
    }
  }, [organization, authLoading, orgLoading]);

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

  // Get template ID for selected type
  const getTemplateId = (): string | undefined => {
    if (!selectedTemplateType || !templates) return undefined;
    const template = templates.find(t => t.template_type === selectedTemplateType);
    return template?.id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug || slugStatus !== 'available' || !selectedTemplateType) return;

    const orgId = await createOrganization({ 
      name, 
      slug, 
      templateId: getTemplateId() 
    });
    if (orgId) {
      // Use full page reload to ensure context picks up new org
      window.location.href = `/admin/onboarding?org=${slug}`;
    }
  };

  if (authLoading || orgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const siteTypeOptions = [
    {
      type: 'single_property' as TemplateType,
      icon: Home,
      title: 'Single Property Site',
      description: 'Perfect for showcasing one vacation rental with a dedicated website',
      features: ['Focused property showcase', 'Streamlined booking flow', 'Simplified management'],
    },
    {
      type: 'multi_property' as TemplateType,
      icon: Building,
      title: 'Multi-Property Portfolio',
      description: 'Ideal for managing and marketing multiple properties',
      features: ['Property listings & search', 'Portfolio management', 'Scalable for growth'],
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-2xl">
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Site Type Selection */}
            <div className="space-y-3">
              <Label>Choose Your Site Type</Label>
              <p className="text-sm text-muted-foreground">
                You can change this later in your organization settings
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {siteTypeOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedTemplateType === option.type;
                  
                  return (
                    <button
                      key={option.type}
                      type="button"
                      onClick={() => setSelectedTemplateType(option.type)}
                      className={cn(
                        "relative p-4 rounded-lg border-2 text-left transition-all",
                        "hover:border-primary/50 hover:bg-muted/50",
                        isSelected 
                          ? "border-primary bg-primary/5" 
                          : "border-border"
                      )}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div className="flex items-center gap-3 mb-2">
                        <div className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center",
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold">{option.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {option.description}
                      </p>
                      <ul className="space-y-1">
                        {option.features.map((feature, idx) => (
                          <li key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>
              {loadingTemplates && (
                <p className="text-xs text-muted-foreground">Loading templates...</p>
              )}
            </div>

            {/* Organization Details */}
            <div className="space-y-4 pt-2">
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
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={creating || !name || !slug || slugStatus !== 'available' || !selectedTemplateType}
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
