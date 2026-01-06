import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useCreateOrganization } from '@/hooks/useOnboarding';
import { useOrganizationTemplates, OrganizationTemplate } from '@/hooks/useOrganizationTemplates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Loader2, CheckCircle2, XCircle, Plus, Package, Star, ChevronDown, DollarSign } from 'lucide-react';
import { TemplateCard } from '@/components/signup/TemplateCard';
import { TemplatePreviewDrawer } from '@/components/signup/TemplatePreviewDrawer';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

// Format price from cents to dollars
const formatPrice = (cents: number): string => {
  return `$${(cents / 100).toFixed(0)}`;
};

const OrganizationSignup = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { organization, loading: orgLoading } = useCurrentOrganization();
  const { createOrganization, checkSlugAvailability, creating } = useCreateOrganization();
  const { data: templates, isLoading: loadingTemplates } = useOrganizationTemplates();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [selectedTemplate, setSelectedTemplate] = useState<OrganizationTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<OrganizationTemplate | null>(null);
  const [includeDemoData, setIncludeDemoData] = useState(true); // Default to ON
  const [isWhatsIncludedOpen, setIsWhatsIncludedOpen] = useState(false);

  // Redirect if already has organization - go to dashboard instead of onboarding
  useEffect(() => {
    if (!authLoading && !orgLoading && organization?.slug) {
      window.location.href = `/admin/dashboard?org=${organization.slug}`;
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

  // When template is selected, sync its demo data default (defaulting to ON if available)
  useEffect(() => {
    if (selectedTemplate) {
      // Default to ON if demo data is available
      setIncludeDemoData(selectedTemplate.include_demo_data && selectedTemplate.source_organization_id != null);
    }
  }, [selectedTemplate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug || slugStatus !== 'available' || !selectedTemplate) return;

    const orgId = await createOrganization({ 
      name, 
      slug, 
      visualTemplateId: selectedTemplate.id,
      includeDemoData,
    });
    if (orgId) {
      // Use full page reload to ensure context picks up new org
      // Redirect to dashboard - onboarding is now optional in settings
      window.location.href = `/admin/dashboard?org=${slug}`;
    }
  };

  if (authLoading || orgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if selected template has demo data available
  const hasDemoDataAvailable = selectedTemplate?.include_demo_data && selectedTemplate?.source_organization_id != null;
  const pricingTier = selectedTemplate?.pricing_tier;
  const featureHighlights = selectedTemplate?.feature_highlights || [];

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Create Your Organization</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Choose a template to get started with your vacation rental management platform
          </p>
        </div>

        {/* Template Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Choose Your Template</h2>
              <p className="text-sm text-muted-foreground">
                Select a template that matches your needs. You can customize it later.
              </p>
            </div>
          </div>

          {loadingTemplates ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {templates?.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplate?.id === template.id}
                  onSelect={() => setSelectedTemplate(template)}
                  onPreview={() => setPreviewTemplate(template)}
                />
              ))}
              
              {/* Coming Soon Card */}
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/60 p-8 text-center bg-muted/20">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-muted-foreground">More Templates</h3>
                <p className="text-sm text-muted-foreground/80 mt-1">Coming soon</p>
              </div>
            </div>
          )}
        </div>

        {/* Organization Details Form */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>
              Enter your organization name and choose a unique URL
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
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

              {/* Selected Template Info */}
              {selectedTemplate && pricingTier && (
                <div className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <DollarSign className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {selectedTemplate.name} Template
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Includes the {pricingTier.name} plan
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-primary text-primary-foreground text-lg px-3 py-1">
                      {formatPrice(pricingTier.monthly_price_cents)}/mo
                    </Badge>
                  </div>
                </div>
              )}

              {/* What's Included Collapsible */}
              {selectedTemplate && featureHighlights.length > 0 && (
                <Collapsible open={isWhatsIncludedOpen} onOpenChange={setIsWhatsIncludedOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-4 h-auto rounded-lg border bg-muted/30 hover:bg-muted/50">
                      <span className="font-medium flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-500" />
                        What's Included
                      </span>
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform",
                        isWhatsIncludedOpen && "rotate-180"
                      )} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {featureHighlights.map((feature, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                        >
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Demo Data Toggle */}
              {hasDemoDataAvailable && (
                <div className="flex items-center justify-between rounded-lg border p-4 bg-green-500/5 border-green-500/20">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-2 rounded-lg bg-green-500/10">
                      <Package className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="demo-data" className="text-base font-medium cursor-pointer">
                        Include sample content
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Start with demo properties, blog posts, testimonials, and more to see how your site will look
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="demo-data"
                    checked={includeDemoData}
                    onCheckedChange={setIncludeDemoData}
                    className="data-[state=checked]:bg-green-500"
                  />
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={creating || !name || !slug || slugStatus !== 'available' || !selectedTemplate}
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Organization...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Create Organization
                  </>
                )}
              </Button>

              {!selectedTemplate && (
                <p className="text-center text-sm text-muted-foreground">
                  Please select a template above to continue
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Preview Drawer */}
      <TemplatePreviewDrawer
        template={previewTemplate}
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onSelect={(template) => setSelectedTemplate(template)}
      />
    </div>
  );
};

export default OrganizationSignup;
