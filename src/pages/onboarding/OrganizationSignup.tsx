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

// Format price from cents to dollars (floor to avoid rounding up)
const formatPrice = (cents: number): string => {
  return `$${Math.floor(cents / 100)}`;
};

// Read pending data synchronously during initialization to avoid race conditions
const getPendingData = (): { name?: string; slug?: string; planSlug?: string } | null => {
  try {
    const pending = localStorage.getItem('pendingOrganization');
    if (pending) {
      const data = JSON.parse(pending);
      console.log('OrganizationSignup: Loaded pending data:', data);
      return data;
    }
  } catch (e) {
    console.error('Failed to parse pending organization data', e);
  }
  return null;
};

const OrganizationSignup = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { organization, loading: orgLoading } = useCurrentOrganization();
  const { createOrganization, checkSlugAvailability, creating } = useCreateOrganization();
  const { data: templates, isLoading: loadingTemplates } = useOrganizationTemplates();

  // Use lazy initialization to read localStorage synchronously
  const [pendingData] = useState(() => getPendingData());
  
  const [name, setName] = useState(() => pendingData?.name || '');
  const [slug, setSlug] = useState(() => pendingData?.slug || '');
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [selectedTemplate, setSelectedTemplate] = useState<OrganizationTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<OrganizationTemplate | null>(null);
  const [includeDemoData, setIncludeDemoData] = useState(true); // Default to ON
  const [isWhatsIncludedOpen, setIsWhatsIncludedOpen] = useState(false);
  const [userHasEditedName, setUserHasEditedName] = useState(false);
  
  // Derive these from pendingData - computed once during initial render
  const hasPendingData = !!pendingData?.name && !!pendingData?.slug;
  const allowedTemplateType: 'single_property' | 'multi_property' | null = 
    pendingData?.planSlug === 'single_property' ? 'single_property' : 
    pendingData?.planSlug ? 'multi_property' : null;

  // Debug log
  console.log('OrganizationSignup State:', { hasPendingData, name, slug, allowedTemplateType, pendingData });

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


  // Auto-generate slug from name (only if no pending data AND user is actively typing)
  useEffect(() => {
    if (hasPendingData || !userHasEditedName) return; // Don't auto-generate if we loaded from pending data
    const generatedSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 30);
    setSlug(generatedSlug);
  }, [name, hasPendingData, userHasEditedName]);

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
      // Clear pending data after successful creation
      localStorage.removeItem('pendingOrganization');
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-lg shadow-primary/10">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            {hasPendingData ? 'Choose Your Template' : 'Create Your Organization'}
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-lg">
            {hasPendingData 
              ? 'Select a design template for your site — you can customize everything later'
              : 'Choose a template and enter your details to get started'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Organization Name & Slug - Only show if not pre-filled from signup */}
          {!hasPendingData && (
            <Card className="border-2 border-border/50 shadow-lg">
              <CardContent className="pt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base font-medium">Organization Name</Label>
                    <Input
                      id="name"
                      placeholder="My Vacation Rentals"
                      value={name}
                      onChange={(e) => { setName(e.target.value); setUserHasEditedName(true); }}
                      required
                      minLength={2}
                      maxLength={100}
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug" className="text-base font-medium">URL Slug</Label>
                    <div className="relative">
                      <Input
                        id="slug"
                        placeholder="my-rentals"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        required
                        minLength={3}
                        maxLength={30}
                        className="pr-10 h-12 text-base"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {slugStatus === 'checking' && (
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        )}
                        {slugStatus === 'available' && (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        )}
                        {slugStatus === 'taken' && (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your site: <span className="font-mono font-medium text-foreground">{slug || 'your-slug'}.staymoxie.com</span>
                    </p>
                    {slugStatus === 'taken' && (
                      <p className="text-sm text-destructive font-medium">This slug is already taken</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Show a summary card when org info is pre-filled */}
          {hasPendingData && name && slug && (
            <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{name}</p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-mono">{slug}.staymoxie.com</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Template Selection */}
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-2xl font-semibold">Choose Your Template</h2>
              <p className="text-muted-foreground mt-1">
                Select a template that matches your needs — you can customize everything later
              </p>
            </div>

            {loadingTemplates ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {templates
                  ?.filter((template) => {
                    // Filter templates based on the user's selected plan tier
                    if (!allowedTemplateType) return true; // Show all if no filter set
                    return template.template_type === allowedTemplateType;
                  })
                  .map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isSelected={selectedTemplate?.id === template.id}
                    onSelect={() => setSelectedTemplate(template)}
                    onPreview={() => setPreviewTemplate(template)}
                  />
                ))}
                
                {/* Coming Soon Card */}
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 p-10 text-center bg-muted/10 hover:bg-muted/20 transition-colors">
                  <div className="h-14 w-14 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <Plus className="h-7 w-7 text-muted-foreground/70" />
                  </div>
                  <h3 className="font-semibold text-muted-foreground">More Templates</h3>
                  <p className="text-sm text-muted-foreground/70 mt-1">Coming soon</p>
                </div>
              </div>
            )}
          </div>

          {/* Selected Template Summary & Options */}
          {selectedTemplate && (
            <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-transparent shadow-lg overflow-hidden">
              <CardContent className="pt-6 space-y-5">
                {/* Template Info */}
                {pricingTier && (
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <DollarSign className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold">
                          {selectedTemplate.name} Template
                        </p>
                        <p className="text-muted-foreground">
                          Includes the {pricingTier.name} plan
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-primary text-primary-foreground text-xl px-4 py-2 font-bold">
                      {formatPrice(pricingTier.monthly_price_cents)}/mo
                    </Badge>
                  </div>
                )}

                {/* What's Included Collapsible */}
                {featureHighlights.length > 0 && (
                  <Collapsible open={isWhatsIncludedOpen} onOpenChange={setIsWhatsIncludedOpen}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-4 h-auto rounded-lg border bg-background/50 hover:bg-background/80">
                        <span className="font-medium flex items-center gap-2">
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          What's Included
                        </span>
                        <ChevronDown className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          isWhatsIncludedOpen && "rotate-180"
                        )} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-3">
                      <div className="grid gap-2 sm:grid-cols-2">
                        {featureHighlights.map((feature, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-center gap-3 p-3 rounded-lg bg-background/50"
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
                  <div className="flex items-center justify-between rounded-xl border-2 p-5 bg-green-500/5 border-green-500/20">
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5 p-2.5 rounded-xl bg-green-500/10">
                        <Package className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="demo-data" className="text-base font-semibold cursor-pointer">
                          Include sample content
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Start with demo properties, blog posts, and testimonials
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="demo-data"
                      checked={includeDemoData}
                      onCheckedChange={setIncludeDemoData}
                      className="data-[state=checked]:bg-green-500 scale-110"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              size="lg"
              className="w-full h-14 text-lg font-semibold shadow-lg shadow-primary/20"
              disabled={creating || !name || !slug || slugStatus !== 'available' || !selectedTemplate}
            >
              {creating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Creating Organization...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Create Organization
                </>
              )}
            </Button>

            {!selectedTemplate && (
              <p className="text-center text-muted-foreground mt-4">
                Please select a template above to continue
              </p>
            )}
          </div>
        </form>
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
