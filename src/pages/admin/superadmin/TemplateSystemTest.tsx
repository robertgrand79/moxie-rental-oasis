import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Play, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ChevronDown,
  Loader2,
  RefreshCw,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TemplateWithDetails {
  id: string;
  name: string;
  description: string | null;
  template_type: string | null;
  include_demo_data: boolean | null;
  demo_data_config: Record<string, boolean> | null;
  preview_url: string | null;
  feature_highlights: string[] | null;
  recommended_for: string[] | null;
  source_organization_id: string | null;
  pricing_tier_id: string | null;
  source_org?: {
    id: string;
    name: string;
    slug: string;
    is_template_source: boolean;
  } | null;
  pricing_tier?: {
    id: string;
    name: string;
    monthly_price_cents: number;
  } | null;
}

interface ValidationResult {
  check: string;
  passed: boolean;
  message: string;
  details?: unknown;
}

interface TestResult {
  templateId: string;
  templateName: string;
  success: boolean;
  orgId?: string;
  orgSlug?: string;
  validations: ValidationResult[];
  demoDataCopied?: Record<string, number>;
  error?: string;
}

const TemplateSystemTest = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());

  // Fetch all templates with their linked data
  const { data: templates, isLoading, refetch } = useQuery({
    queryKey: ['template-system-test-templates'],
    queryFn: async (): Promise<TemplateWithDetails[]> => {
      const { data, error } = await supabase
        .from('organization_templates')
        .select(`
          id,
          name,
          description,
          template_type,
          include_demo_data,
          demo_data_config,
          preview_url,
          feature_highlights,
          recommended_for,
          source_organization_id,
          pricing_tier_id
        `)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;

      // Fetch source orgs and pricing tiers separately
      const enrichedTemplates = await Promise.all(
        (data || []).map(async (template) => {
          let source_org = null;
          let pricing_tier = null;

          if (template.source_organization_id) {
            const { data: org } = await supabase
              .from('organizations')
              .select('id, name, slug, is_template_source')
              .eq('id', template.source_organization_id)
              .single();
            source_org = org;
          }

          if (template.pricing_tier_id) {
            const { data: tier } = await supabase
              .from('site_templates')
              .select('id, name, monthly_price_cents')
              .eq('id', template.pricing_tier_id)
              .single();
            pricing_tier = tier;
          }

          return {
            ...template,
            demo_data_config: template.demo_data_config as Record<string, boolean> | null,
            feature_highlights: template.feature_highlights as string[] | null,
            recommended_for: template.recommended_for as string[] | null,
            source_org,
            pricing_tier,
          };
        })
      );

      return enrichedTemplates;
    },
  });

  // Fetch test organizations for cleanup
  const { data: testOrgs } = useQuery({
    queryKey: ['test-organizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, slug, created_at')
        .like('slug', 'test-%')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Test template mutation
  const testTemplateMutation = useMutation({
    mutationFn: async (template: TemplateWithDetails) => {
      const validations: ValidationResult[] = [];
      const testSlug = `test-${template.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
      const testName = `Test: ${template.name}`;

      // Validation 1: Check source org exists
      if (template.source_organization_id) {
        const { data: sourceOrg } = await supabase
          .from('organizations')
          .select('id, name, is_template_source')
          .eq('id', template.source_organization_id)
          .single();

        validations.push({
          check: 'Source Organization Exists',
          passed: !!sourceOrg,
          message: sourceOrg 
            ? `Found: ${sourceOrg.name}` 
            : `Source org ${template.source_organization_id} not found`,
          details: sourceOrg,
        });

        if (sourceOrg) {
          validations.push({
            check: 'Source Org is Template Source',
            passed: sourceOrg.is_template_source === true,
            message: sourceOrg.is_template_source 
              ? 'Correctly marked as template source'
              : 'WARNING: Not marked as is_template_source=true',
          });
        }
      } else {
        validations.push({
          check: 'Source Organization Linked',
          passed: false,
          message: 'No source organization linked to this template',
        });
      }

      // Validation 2: Check pricing tier exists
      if (template.pricing_tier_id) {
        const { data: tier } = await supabase
          .from('site_templates')
          .select('id, name, monthly_price_cents')
          .eq('id', template.pricing_tier_id)
          .single();

        validations.push({
          check: 'Pricing Tier Linked',
          passed: !!tier,
          message: tier 
            ? `Linked to: ${tier.name} ($${(tier.monthly_price_cents / 100).toFixed(2)}/mo)`
            : 'Pricing tier not found',
          details: tier,
        });
      } else {
        validations.push({
          check: 'Pricing Tier Linked',
          passed: false,
          message: 'No pricing tier linked',
        });
      }

      // Validation 3: Check demo data config
      validations.push({
        check: 'Demo Data Config',
        passed: !!template.demo_data_config && Object.keys(template.demo_data_config).length > 0,
        message: template.demo_data_config 
          ? `Configured: ${Object.keys(template.demo_data_config).filter(k => template.demo_data_config![k]).join(', ')}`
          : 'No demo data config set',
        details: template.demo_data_config,
      });

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create test organization
      const { data: orgId, error: createError } = await supabase
        .rpc('create_organization_with_owner', {
          _name: testName,
          _slug: testSlug,
          _user_id: user.id,
          _visual_template_id: template.id,
          _include_demo_data: true,
        });

      if (createError) {
        validations.push({
          check: 'Organization Creation',
          passed: false,
          message: `Failed: ${createError.message}`,
        });
        throw createError;
      }

      validations.push({
        check: 'Organization Created',
        passed: !!orgId,
        message: orgId ? `Created org: ${orgId}` : 'No org ID returned',
      });

      // Validation 4: Check site_settings were copied
      const { data: settings, count: settingsCount } = await supabase
        .from('site_settings')
        .select('key', { count: 'exact' })
        .eq('organization_id', orgId);

      validations.push({
        check: 'Site Settings Copied',
        passed: (settingsCount || 0) > 5,
        message: `${settingsCount} settings created`,
        details: settings?.map(s => s.key),
      });

      // Validation 5: Check demo data was copied (using raw SQL counts)
      const demoDataCopied: Record<string, number> = {};

      // Properties
      const { count: propCount } = await supabase
        .from('properties')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', orgId);
      demoDataCopied.properties = propCount || 0;

      // Blog posts
      const { count: blogCount } = await supabase
        .from('blog_posts')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', orgId);
      demoDataCopied.blog_posts = blogCount || 0;

      // Testimonials
      const { count: testimonialCount } = await supabase
        .from('testimonials')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', orgId);
      demoDataCopied.testimonials = testimonialCount || 0;

      // Message templates
      const { count: messageCount } = await supabase
        .from('message_templates')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', orgId);
      demoDataCopied.message_templates = messageCount || 0;

      const totalCopied = Object.values(demoDataCopied).reduce((a, b) => a + b, 0);
      validations.push({
        check: 'Demo Data Copied',
        passed: totalCopied > 0,
        message: totalCopied > 0 
          ? `Copied ${totalCopied} items total`
          : 'No demo data copied (source may be empty)',
        details: demoDataCopied,
      });

      // Validation 6: Check org is properly configured
      const { data: org } = await supabase
        .from('organizations')
        .select('id, name, slug, template_type, created_from_template_id')
        .eq('id', orgId)
        .single();

      validations.push({
        check: 'Template Type Set',
        passed: org?.template_type === template.template_type,
        message: `Type: ${org?.template_type || 'not set'}`,
      });

      validations.push({
        check: 'Created From Template Tracked',
        passed: org?.created_from_template_id === template.id,
        message: org?.created_from_template_id === template.id 
          ? 'Correctly linked to template'
          : 'Template link not saved',
      });

      return {
        templateId: template.id,
        templateName: template.name,
        success: true,
        orgId: orgId as string,
        orgSlug: testSlug,
        validations,
        demoDataCopied,
      };
    },
    onSuccess: (result) => {
      setTestResults(prev => [...prev, result]);
      setExpandedResults(prev => new Set(prev).add(result.templateId));
      toast({
        title: 'Test Complete',
        description: `${result.templateName}: ${result.validations.filter(v => v.passed).length}/${result.validations.length} checks passed`,
      });
      queryClient.invalidateQueries({ queryKey: ['test-organizations'] });
    },
    onError: (error, template) => {
      const result: TestResult = {
        templateId: template.id,
        templateName: template.name,
        success: false,
        validations: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      setTestResults(prev => [...prev, result]);
      toast({
        title: 'Test Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  // Cleanup mutation - use RPC for cascading delete
  const cleanupMutation = useMutation({
    mutationFn: async (orgIds: string[]) => {
      let deleted = 0;
      for (const orgId of orgIds) {
        // Delete related data first
        await supabase.from('organization_onboarding').delete().eq('organization_id', orgId);
        await supabase.from('site_settings').delete().eq('organization_id', orgId);
        await supabase.from('assistant_settings').delete().eq('organization_id', orgId);
        await supabase.from('message_templates').delete().eq('organization_id', orgId);
        await supabase.from('properties').delete().eq('organization_id', orgId);
        await supabase.from('blog_posts').delete().eq('organization_id', orgId);
        await supabase.from('testimonials').delete().eq('organization_id', orgId);
        await supabase.from('organization_members').delete().eq('organization_id', orgId);
        
        // Finally delete the org
        const { error } = await supabase.from('organizations').delete().eq('id', orgId);
        if (!error) deleted++;
      }
      return deleted;
    },
    onSuccess: (count) => {
      toast({
        title: 'Cleanup Complete',
        description: `Deleted ${count} test organization(s)`,
      });
      setTestResults([]);
      queryClient.invalidateQueries({ queryKey: ['test-organizations'] });
    },
    onError: (error) => {
      toast({
        title: 'Cleanup Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  const toggleExpanded = (id: string) => {
    setExpandedResults(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Template System Test</h1>
          <p className="text-muted-foreground">
            Validate the entire template creation flow end-to-end
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {testOrgs && testOrgs.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={() => cleanupMutation.mutate(testOrgs.map(o => o.id))}
              disabled={cleanupMutation.isPending}
            >
              {cleanupMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Cleanup {testOrgs.length} Test Org{testOrgs.length > 1 ? 's' : ''}
            </Button>
          )}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {templates?.map((template) => {
          const result = testResults.find(r => r.templateId === template.id);
          const isExpanded = expandedResults.has(template.id);

          return (
            <Card key={template.id} className={result ? (result.success ? 'border-green-500' : 'border-red-500') : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {template.name}
                      {result && (
                        result.success ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )
                      )}
                    </CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </div>
                  <Badge variant={template.template_type === 'single_property' ? 'secondary' : 'default'}>
                    {template.template_type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Template Details */}
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Source Org:</span>
                    <span className={template.source_org ? 'text-green-600' : 'text-red-600'}>
                      {template.source_org?.name || 'Not linked'}
                      {template.source_org?.is_template_source && (
                        <Badge variant="outline" className="ml-2 text-xs">source</Badge>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pricing Tier:</span>
                    <span className={template.pricing_tier ? 'text-green-600' : 'text-amber-600'}>
                      {template.pricing_tier 
                        ? `${template.pricing_tier.name} ($${(template.pricing_tier.monthly_price_cents / 100).toFixed(0)}/mo)`
                        : 'Not linked'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Demo Data:</span>
                    <span className={template.include_demo_data ? 'text-green-600' : 'text-muted-foreground'}>
                      {template.include_demo_data ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Test Results */}
                {result && (
                  <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(template.id)}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between">
                        <span>
                          {result.validations.filter(v => v.passed).length}/{result.validations.length} checks passed
                        </span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <ScrollArea className="h-64 mt-2">
                        <div className="space-y-2 pr-4">
                          {result.validations.map((v, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              {v.passed ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                              )}
                              <div>
                                <div className="font-medium">{v.check}</div>
                                <div className="text-muted-foreground">{v.message}</div>
                              </div>
                            </div>
                          ))}
                          {result.demoDataCopied && (
                            <div className="mt-4 p-2 bg-muted rounded-md">
                              <div className="font-medium mb-1">Demo Data Summary:</div>
                              <div className="grid grid-cols-2 gap-1 text-xs">
                                {Object.entries(result.demoDataCopied).map(([key, count]) => (
                                  <div key={key} className="flex justify-between">
                                    <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                                    <span className={count > 0 ? 'text-green-600' : 'text-muted-foreground'}>{count}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {result.orgSlug && (
                            <div className="mt-2">
                              <Badge variant="outline">Test Org: {result.orgSlug}</Badge>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {result?.error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Test Failed</AlertTitle>
                    <AlertDescription>{result.error}</AlertDescription>
                  </Alert>
                )}

                {/* Action Button */}
                <Button 
                  onClick={() => testTemplateMutation.mutate(template)}
                  disabled={testTemplateMutation.isPending}
                  className="w-full"
                  variant={result ? (result.success ? 'outline' : 'destructive') : 'default'}
                >
                  {testTemplateMutation.isPending && testTemplateMutation.variables?.id === template.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  {result ? 'Re-run Test' : 'Test Template'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Test Organizations */}
      {testOrgs && testOrgs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Test Organizations
            </CardTitle>
            <CardDescription>
              Organizations created with test- prefix during validation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {testOrgs.map((org) => (
                <div key={org.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <div>
                    <div className="font-medium">{org.name}</div>
                    <div className="text-sm text-muted-foreground">{org.slug}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(org.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TemplateSystemTest;
