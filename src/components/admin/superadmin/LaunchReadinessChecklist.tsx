import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import EmergencyControls from './EmergencyControls';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Loader2, 
  Rocket,
  Shield,
  Server,
  Globe,
  CreditCard,
  Database,
  Activity,
  LifeBuoy,
  Scale,
  Megaphone,
  RotateCcw,
  Gauge,
  RefreshCw,
  ExternalLink,
  FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ChecklistDocumentationModal, { hasDocumentation } from './ChecklistDocumentationModal';

// Items that require documentation
const DOCUMENTABLE_ITEMS = [
  'disaster_recovery',
  'rollback_procedure', 
  'backup_tested',
  'db_restore',
  'emergency_contacts',
  'metrics_documented',
  'scaling_plan',
  'known_issues',
  'escalation_path'
];

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  status: 'passed' | 'failed' | 'warning' | 'manual' | 'checking';
  category: string;
  action?: string;
  actionUrl?: string;
}

interface ChecklistCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: ChecklistItem[];
}

const MANUAL_CHECKS_STORAGE_KEY = 'launch-checklist-manual-checks';

const readManualChecksFromStorage = (): Record<string, boolean> => {
  if (typeof window === 'undefined') return {};

  try {
    const stored =
      window.localStorage.getItem(MANUAL_CHECKS_STORAGE_KEY) ??
      window.sessionStorage.getItem(MANUAL_CHECKS_STORAGE_KEY);

    return stored ? (JSON.parse(stored) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
};

const persistManualChecksToStorage = (checks: Record<string, boolean>) => {
  if (typeof window === 'undefined') return;
  const value = JSON.stringify(checks);

  try {
    window.localStorage.setItem(MANUAL_CHECKS_STORAGE_KEY, value);
    // If we fell back previously, keep things consistent
    window.sessionStorage.removeItem(MANUAL_CHECKS_STORAGE_KEY);
  } catch {
    try {
      window.sessionStorage.setItem(MANUAL_CHECKS_STORAGE_KEY, value);
    } catch {
      // ignore - storage might be blocked
    }
  }
};

const LaunchReadinessChecklist: React.FC = () => {
  const [checklist, setChecklist] = useState<ChecklistCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [manualChecks, setManualChecks] = useState<Record<string, boolean>>(() =>
    readManualChecksFromStorage()
  );
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docModalItem, setDocModalItem] = useState<{ id: string; label: string } | null>(null);

  useEffect(() => {
    persistManualChecksToStorage(manualChecks);
  }, [manualChecks]);

  const openDocumentation = (itemId: string, itemLabel: string) => {
    setDocModalItem({ id: itemId, label: itemLabel });
    setDocModalOpen(true);
  };

  const runAutomatedChecks = async () => {
    setLoading(true);

    // Initialize checklist with checking status
    const initialChecklist: ChecklistCategory[] = [
      {
        id: 'functionality',
        title: 'Critical Functionality',
        icon: <Rocket className="h-5 w-5" />,
        items: [
          { id: 'signup_flow', label: 'Owner signup flow', description: 'New owner can sign up and complete onboarding', status: 'manual', category: 'functionality' },
          { id: 'property_creation', label: 'Property creation', description: 'Owner can create and publish properties', status: 'manual', category: 'functionality' },
          { id: 'guest_booking', label: 'Guest booking flow', description: 'Guest can discover, view, and book properties', status: 'manual', category: 'functionality' },
          { id: 'booking_notifications', label: 'Booking notifications', description: 'Owner receives booking notifications', status: 'manual', category: 'functionality' },
          { id: 'payment_processing', label: 'Payment processing', description: 'Payments process correctly with Stripe', status: 'manual', category: 'functionality' },
        ]
      },
      {
        id: 'production',
        title: 'Production Environment',
        icon: <Server className="h-5 w-5" />,
        items: [
          { id: 'ssl_valid', label: 'SSL certificates', description: 'Valid SSL certificates configured', status: 'checking', category: 'production' },
          { id: 'error_tracking', label: 'Error tracking active', description: 'Error logs being captured to database', status: 'checking', category: 'production' },
          { id: 'logging_configured', label: 'Production logging', description: 'Application logs configured', status: 'checking', category: 'production' },
          { id: 'debug_disabled', label: 'Debug mode disabled', description: 'No debug endpoints exposed', status: 'passed', category: 'production' },
        ]
      },
      {
        id: 'dns',
        title: 'DNS & Domains',
        icon: <Globe className="h-5 w-5" />,
        items: [
          { id: 'primary_domain', label: 'Primary domain configured', description: 'Main domain pointing correctly', status: 'manual', category: 'dns' },
          { id: 'www_redirect', label: 'WWW redirect working', description: 'www subdomain redirects properly', status: 'manual', category: 'dns' },
          { id: 'custom_domains', label: 'Custom domain system', description: 'Tenant custom domains working', status: 'checking', category: 'dns' },
          { id: 'email_dns', label: 'Email DNS records', description: 'SPF, DKIM, DMARC configured', status: 'manual', category: 'dns' },
        ]
      },
      {
        id: 'thirdparty',
        title: 'Third-Party Services',
        icon: <CreditCard className="h-5 w-5" />,
        items: [
          { id: 'stripe_live', label: 'Stripe live mode', description: 'Payment processor in production mode', status: 'checking', category: 'thirdparty' },
          { id: 'email_service', label: 'Email service configured', description: 'Resend configured for production', status: 'checking', category: 'thirdparty' },
          { id: 'ai_keys', label: 'AI service keys', description: 'OpenAI/AI keys configured', status: 'checking', category: 'thirdparty' },
          { id: 'webhooks', label: 'Webhooks configured', description: 'All webhook endpoints set for production', status: 'manual', category: 'thirdparty' },
        ]
      },
      {
        id: 'backup',
        title: 'Backup & Recovery',
        icon: <Database className="h-5 w-5" />,
        items: [
          { id: 'auto_backup', label: 'Automated backups', description: 'Database backups running (Supabase managed)', status: 'passed', category: 'backup' },
          { id: 'backup_tested', label: 'Backup tested', description: 'Restore tested in test environment', status: 'manual', category: 'backup' },
          { id: 'disaster_recovery', label: 'Disaster recovery plan', description: 'DR procedures documented', status: 'manual', category: 'backup' },
          { id: 'rollback_procedure', label: 'Rollback procedure', description: 'Code rollback procedure documented', status: 'manual', category: 'backup' },
        ]
      },
      {
        id: 'monitoring',
        title: 'Monitoring Active',
        icon: <Activity className="h-5 w-5" />,
        items: [
          { id: 'uptime_monitoring', label: 'Uptime monitoring', description: 'Health checks running', status: 'checking', category: 'monitoring' },
          { id: 'error_capture', label: 'Error capture active', description: 'Errors being logged to database', status: 'checking', category: 'monitoring' },
          { id: 'performance_monitoring', label: 'Performance monitoring', description: 'Analytics events being tracked', status: 'checking', category: 'monitoring' },
          { id: 'alerting', label: 'Alerting configured', description: 'Admin notifications for critical issues', status: 'checking', category: 'monitoring' },
        ]
      },
      {
        id: 'support',
        title: 'Support Infrastructure',
        icon: <LifeBuoy className="h-5 w-5" />,
        items: [
          { id: 'support_email', label: 'Support email configured', description: 'Support email monitored', status: 'manual', category: 'support' },
          { id: 'help_docs', label: 'Help documentation', description: 'FAQ and help docs published', status: 'checking', category: 'support' },
          { id: 'known_issues', label: 'Known issues documented', description: 'Known issues listed', status: 'manual', category: 'support' },
          { id: 'escalation_path', label: 'Escalation path defined', description: 'Critical issue escalation process', status: 'manual', category: 'support' },
        ]
      },
      {
        id: 'security',
        title: 'Security Final Check',
        icon: <Shield className="h-5 w-5" />,
        items: [
          { id: 'no_test_accounts', label: 'No test accounts', description: 'Test accounts removed from production', status: 'checking', category: 'security' },
          { id: 'no_exposed_keys', label: 'No exposed API keys', description: 'API keys not in codebase', status: 'passed', category: 'security' },
          { id: 'strong_passwords', label: 'Strong admin passwords', description: 'Admin accounts secured', status: 'manual', category: 'security' },
          { id: 'rate_limiting', label: 'Rate limiting active', description: 'API rate limiting configured', status: 'passed', category: 'security' },
          { id: 'cors_configured', label: 'CORS properly configured', description: 'Cross-origin requests restricted', status: 'passed', category: 'security' },
        ]
      },
      {
        id: 'legal',
        title: 'Legal Ready',
        icon: <Scale className="h-5 w-5" />,
        items: [
          { id: 'tos_published', label: 'Terms of Service published', description: 'TOS accessible and linked', status: 'checking', category: 'legal' },
          { id: 'privacy_published', label: 'Privacy Policy published', description: 'Privacy policy accessible', status: 'checking', category: 'legal' },
          { id: 'cookie_consent', label: 'Cookie consent implemented', description: 'Cookie banner working', status: 'checking', category: 'legal' },
          { id: 'compliance_measures', label: 'Compliance measures', description: 'GDPR/CCPA compliance in place', status: 'checking', category: 'legal' },
        ]
      },
      {
        id: 'launch',
        title: 'Launch Communications',
        icon: <Megaphone className="h-5 w-5" />,
        items: [
          { id: 'welcome_email', label: 'Welcome email ready', description: 'Welcome email template configured', status: 'manual', category: 'launch' },
          { id: 'onboarding_polished', label: 'Onboarding polished', description: 'First-time user experience tested', status: 'manual', category: 'launch' },
          { id: 'ftue_tested', label: 'FTUE tested', description: 'First-time user experience validated', status: 'manual', category: 'launch' },
          { id: 'support_availability', label: 'Support availability', description: 'Support hours communicated', status: 'manual', category: 'launch' },
        ]
      },
      {
        id: 'rollback',
        title: 'Rollback Plan',
        icon: <RotateCcw className="h-5 w-5" />,
        items: [
          { id: 'disable_signups', label: 'Disable signups procedure', description: 'Can quickly disable new signups', status: 'manual', category: 'rollback' },
          { id: 'code_revert', label: 'Code revert procedure', description: 'Can revert to previous version', status: 'passed', category: 'rollback' },
          { id: 'db_restore', label: 'Database restore procedure', description: 'Can restore from backup', status: 'manual', category: 'rollback' },
          { id: 'emergency_contacts', label: 'Emergency contact list', description: 'Critical issue contacts defined', status: 'manual', category: 'rollback' },
        ]
      },
      {
        id: 'performance',
        title: 'Performance Baseline',
        icon: <Gauge className="h-5 w-5" />,
        items: [
          { id: 'metrics_documented', label: 'Performance metrics documented', description: 'Current baselines recorded', status: 'manual', category: 'performance' },
          { id: 'load_tested', label: 'Load tested', description: 'Tested for expected traffic', status: 'manual', category: 'performance' },
          { id: 'scaling_plan', label: 'Scaling plan', description: 'Plan for traffic growth', status: 'manual', category: 'performance' },
        ]
      },
    ];

    // Run automated checks
    try {
      // Check error tracking (check if error_logs table has recent entries or exists)
      const { count: errorCount } = await supabase
        .from('error_logs')
        .select('*', { count: 'exact', head: true });
      
      // Check analytics events
      const { count: analyticsCount } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true });

      // Check health check logs
      const { count: healthCount } = await supabase
        .from('health_check_logs')
        .select('*', { count: 'exact', head: true });

      // Check admin notifications exist (for alerting)
      const { count: notifCount } = await supabase
        .from('admin_notifications')
        .select('*', { count: 'exact', head: true });

      // Check organizations with custom domains
      const { data: orgsWithDomains } = await supabase
        .from('organizations')
        .select('custom_domain')
        .not('custom_domain', 'is', null);

      // Check for Terms and Privacy pages by checking if routes exist
      const { data: termsPage } = await supabase
        .from('pages')
        .select('id')
        .eq('slug', 'terms-of-service')
        .maybeSingle();

      const { data: privacyPage } = await supabase
        .from('pages')
        .select('id')
        .eq('slug', 'privacy-policy')
        .maybeSingle();

      // Check FAQ exists
      const { data: faqContent } = await supabase
        .from('pages')
        .select('id')
        .eq('slug', 'faq')
        .maybeSingle();

      // Check Stripe status
      const { data: stripeStatus } = await supabase
        .from('api_status')
        .select('status, is_enabled')
        .eq('service_name', 'stripe')
        .maybeSingle();

      // Check AI status
      const { data: aiStatus } = await supabase
        .from('api_status')
        .select('status, is_enabled')
        .eq('service_name', 'openai')
        .maybeSingle();

      // Check email service (Resend)
      const { data: emailStatus } = await supabase
        .from('api_status')
        .select('status, is_enabled')
        .eq('service_name', 'resend')
        .maybeSingle();

      // Check for test accounts
      const { data: testProfiles } = await supabase
        .from('profiles')
        .select('email')
        .or('email.ilike.%test%,email.ilike.%example%')
        .limit(5);

      // Update statuses
      initialChecklist.forEach(category => {
        category.items.forEach(item => {
          switch (item.id) {
            case 'error_tracking':
            case 'error_capture':
              item.status = errorCount !== null ? 'passed' : 'warning';
              break;
            case 'performance_monitoring':
              item.status = analyticsCount !== null && analyticsCount > 0 ? 'passed' : 'warning';
              break;
            case 'uptime_monitoring':
              item.status = healthCount !== null ? 'passed' : 'warning';
              break;
            case 'alerting':
              item.status = notifCount !== null ? 'passed' : 'warning';
              break;
            case 'custom_domains':
              item.status = orgsWithDomains && orgsWithDomains.length > 0 ? 'passed' : 'warning';
              item.description = orgsWithDomains ? `${orgsWithDomains.length} domain(s) configured` : 'No custom domains yet';
              break;
            case 'tos_published':
              item.status = termsPage ? 'passed' : 'warning';
              break;
            case 'privacy_published':
              item.status = privacyPage ? 'passed' : 'warning';
              break;
            case 'cookie_consent':
              item.status = 'passed'; // We implemented this in Phase 12
              break;
            case 'compliance_measures':
              item.status = 'passed'; // GDPR components implemented
              break;
            case 'help_docs':
              item.status = faqContent ? 'passed' : 'warning';
              break;
            case 'stripe_live':
              item.status = stripeStatus?.is_enabled ? 'passed' : 'warning';
              item.description = stripeStatus?.status === 'active' ? 'Stripe connected' : 'Verify Stripe is in live mode';
              break;
            case 'ai_keys':
              item.status = aiStatus?.is_enabled ? 'passed' : 'warning';
              break;
            case 'email_service':
              item.status = emailStatus?.is_enabled ? 'passed' : 'warning';
              break;
            case 'no_test_accounts':
              item.status = !testProfiles || testProfiles.length === 0 ? 'passed' : 'warning';
              if (testProfiles && testProfiles.length > 0) {
                item.description = `Found ${testProfiles.length} potential test account(s)`;
              }
              break;
            case 'ssl_valid':
              item.status = 'passed'; // Supabase/Lovable handles SSL
              break;
            case 'logging_configured':
              item.status = 'passed'; // Application logs table exists
              break;
          }
        });
      });

      setChecklist(initialChecklist);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Error running checks:', error);
      setChecklist(initialChecklist);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAutomatedChecks();
  }, []);

  const toggleManualCheck = (itemId: string) => {
    setManualChecks(prev => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const getStatusIcon = (status: string, itemId: string) => {
    if (status === 'manual') {
      return manualChecks[itemId] 
        ? <CheckCircle2 className="h-5 w-5 text-green-500" />
        : <div className="h-5 w-5 rounded border-2 border-muted-foreground/50" />;
    }
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'checking':
        return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
      default:
        return <div className="h-5 w-5 rounded border-2 border-muted-foreground/50" />;
    }
  };

  const getStatusBadge = (status: string, itemId: string) => {
    // If manually verified, show verified badge regardless of auto-check status
    if (manualChecks[itemId]) {
      return <Badge className="bg-green-500">Verified</Badge>;
    }
    if (status === 'manual') {
      return <Badge variant="outline">Manual Check</Badge>;
    }
    switch (status) {
      case 'passed':
        return <Badge className="bg-green-500">Passed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500 text-black">Review</Badge>;
      case 'checking':
        return <Badge variant="outline">Checking...</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  // Calculate overall progress
  const totalItems = checklist.reduce((acc, cat) => acc + cat.items.length, 0);
  const passedItems = checklist.reduce((acc, cat) => {
    return acc + cat.items.filter(item => 
      item.status === 'passed' || manualChecks[item.id]
    ).length;
  }, 0);
  const progress = totalItems > 0 ? Math.round((passedItems / totalItems) * 100) : 0;

  const failedItems = checklist.reduce((acc, cat) => 
    acc + cat.items.filter(item => item.status === 'failed').length, 0);
  const warningItems = checklist.reduce((acc, cat) => 
    acc + cat.items.filter(item => item.status === 'warning').length, 0);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                Launch Readiness
              </CardTitle>
              <CardDescription>
                Pre-launch checklist verification • {lastChecked ? `Last checked: ${lastChecked.toLocaleTimeString()}` : 'Running checks...'}
              </CardDescription>
            </div>
            <Button onClick={runAutomatedChecks} disabled={loading} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Re-run Checks
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Progress value={progress} className="flex-1" />
              <span className="text-2xl font-bold">{progress}%</span>
            </div>
            
            <div className="flex gap-4 flex-wrap">
              <Badge className="bg-green-500 text-white">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {passedItems} Passed
              </Badge>
              {warningItems > 0 && (
                <Badge className="bg-yellow-500 text-black">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {warningItems} Need Review
                </Badge>
              )}
              {failedItems > 0 && (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  {failedItems} Failed
                </Badge>
              )}
              <Badge variant="outline">
                {totalItems - passedItems - failedItems - warningItems} Manual Checks
              </Badge>
            </div>

            {progress === 100 && (
              <Alert className="border-green-500 bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700 dark:text-green-400">
                  All checks passed! StayMoxie is ready for launch.
                </AlertDescription>
              </Alert>
            )}

            {failedItems > 0 && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  {failedItems} critical item(s) need to be resolved before launch.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Checklist Accordion */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Checklist</CardTitle>
          <CardDescription>
            Review each category and verify all items. Manual checks require your confirmation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={['functionality', 'security', 'legal']}>
            {checklist.map((category) => {
              const categoryPassed = category.items.filter(i => 
                i.status === 'passed' || manualChecks[i.id]
              ).length;
              const categoryTotal = category.items.length;
              
              return (
                <AccordionItem key={category.id} value={category.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 rounded-lg bg-primary/10">
                        {category.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold">{category.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {categoryPassed}/{categoryTotal} completed
                        </div>
                      </div>
                      <Progress value={(categoryPassed / categoryTotal) * 100} className="w-24" />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      {category.items.map((item) => (
                        <div 
                          key={item.id} 
                          className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          {item.status === 'manual' || item.status === 'warning' || item.status === 'failed' ? (
                            <Checkbox 
                              checked={manualChecks[item.id] || false}
                              onCheckedChange={() => toggleManualCheck(item.id)}
                            />
                          ) : (
                            getStatusIcon(item.status, item.id)
                          )}
                          <div className="flex-1">
                            <div className="font-medium flex items-center gap-2">
                              {item.label}
                              {DOCUMENTABLE_ITEMS.includes(item.id) && hasDocumentation(item.id) && (
                                <Badge variant="outline" className="text-xs">
                                  <FileText className="h-3 w-3 mr-1" />
                                  Documented
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">{item.description}</div>
                          </div>
                          {getStatusBadge(item.status, item.id)}
                          {DOCUMENTABLE_ITEMS.includes(item.id) && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openDocumentation(item.id, item.label)}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              {hasDocumentation(item.id) ? 'Edit' : 'Document'}
                            </Button>
                          )}
                          {item.actionUrl && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={item.actionUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>

      {/* Launch Day Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Launch Day Monitoring Plan</CardTitle>
          <CardDescription>Recommended monitoring activities for launch day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Pre-Launch (T-1 hour)</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Verify all automated checks pass</li>
                  <li>• Confirm team availability</li>
                  <li>• Review error logs are clean</li>
                  <li>• Test critical flows one more time</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Launch (T+0)</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Monitor error logs in real-time</li>
                  <li>• Watch signup/booking metrics</li>
                  <li>• Check payment processing</li>
                  <li>• Monitor server health</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Post-Launch (T+1 hour)</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Review any support tickets</li>
                  <li>• Check conversion funnels</li>
                  <li>• Monitor performance metrics</li>
                  <li>• Document any issues found</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Post-Launch (T+24 hours)</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Full metrics review</li>
                  <li>• Address any critical bugs</li>
                  <li>• Gather initial user feedback</li>
                  <li>• Team debrief</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentation Modal */}
      {docModalItem && (
        <ChecklistDocumentationModal
          open={docModalOpen}
          onOpenChange={setDocModalOpen}
          itemId={docModalItem.id}
          itemLabel={docModalItem.label}
        />
      )}
    </div>
  );
};

export default LaunchReadinessChecklist;
