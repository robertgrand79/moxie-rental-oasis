import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Save, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ChecklistDocumentationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string;
  itemLabel: string;
  defaultTemplate?: string;
}

const DOCS_STORAGE_KEY = 'launch-checklist-documentation';

const DOCUMENTATION_TEMPLATES: Record<string, string> = {
  disaster_recovery: `# Disaster Recovery Plan - StayMoxie

## 1. Backup Strategy
- **Database**: Supabase automatic daily backups (Pro plan: 7-day retention)
- **Code**: GitHub repository with version history
- **Secrets**: Documented in secure password manager

## 2. Recovery Procedures

| Scenario | RTO | Steps |
|----------|-----|-------|
| Database corruption | 4 hrs | Restore from Supabase point-in-time backup |
| Accidental deletion | 1 hr | Restore specific tables from backup |
| Edge function failure | 15 min | Redeploy from GitHub |
| Full outage | 8 hrs | Spin up new Supabase project, restore backup, update DNS |

## 3. Critical Data Priority
1. organizations & profiles (tenant/user data)
2. reservations & properties (business operations)
3. guest_profiles & payment records

## 4. Testing Schedule
- Monthly: Verify backup exists in Supabase dashboard
- Quarterly: Test restore to staging environment
- Annually: Full DR simulation

## 5. Contacts
- Primary: [Your name/email]
- Supabase Support: support@supabase.io
`,
  rollback_procedure: `# Code Rollback Procedure

## Quick Rollback Steps
1. Identify the last stable commit in GitHub
2. In Lovable, use version history to revert
3. Verify the rollback in preview
4. Publish the reverted version

## Database Rollback
1. Go to Supabase Dashboard > Database > Backups
2. Select the point-in-time to restore
3. Confirm restoration
4. Update any necessary edge functions

## Emergency Contacts
- [Your contact info]
`,
  backup_tested: `# Backup Test Documentation

## Last Test Date: [DATE]

## Test Procedure
1. Accessed Supabase Dashboard > Database > Backups
2. Verified automatic backups are enabled
3. Checked backup retention period
4. [Optional] Restored backup to test environment

## Results
- Backup exists: ☐ Yes ☐ No
- Backup date verified: [DATE]
- Restoration test passed: ☐ Yes ☐ No ☐ Not tested

## Notes
[Add any observations or issues]
`,
  db_restore: `# Database Restore Procedure

## Supabase Point-in-Time Recovery

### Prerequisites
- Supabase Pro plan or higher
- Admin access to Supabase Dashboard

### Steps
1. Go to Supabase Dashboard > Database > Backups
2. Click "Restore" and select the recovery point
3. Choose destination (same project or new)
4. Confirm and wait for restoration
5. Verify data integrity with test queries

### Post-Restore Checklist
☐ Verify organization count matches expected
☐ Verify recent reservations are intact
☐ Test authentication flow
☐ Verify edge functions are working

### Verification Queries
\`\`\`sql
SELECT COUNT(*) FROM organizations;
SELECT COUNT(*) FROM profiles;
SELECT COUNT(*) FROM reservations WHERE created_at > now() - interval '7 days';
\`\`\`
`,
  emergency_contacts: `# Emergency Contact List

## Platform Team
| Role | Name | Phone | Email |
|------|------|-------|-------|
| Lead Developer | | | |
| Platform Admin | | | |
| On-Call Support | | | |

## Third-Party Support
| Service | Support URL | Priority Contact |
|---------|-------------|------------------|
| Supabase | support@supabase.io | Dashboard > Support |
| Stripe | dashboard.stripe.com/support | |
| Resend | resend.com/support | |

## Escalation Path
1. First responder attempts fix (15 min)
2. Escalate to lead developer
3. If critical: Enable maintenance mode
4. Communicate status to affected tenants
`,
};

const readDocsFromStorage = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  try {
    const stored =
      window.localStorage.getItem(DOCS_STORAGE_KEY) ??
      window.sessionStorage.getItem(DOCS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const persistDocsToStorage = (docs: Record<string, string>) => {
  if (typeof window === 'undefined') return;
  const value = JSON.stringify(docs);
  try {
    window.localStorage.setItem(DOCS_STORAGE_KEY, value);
    window.sessionStorage.removeItem(DOCS_STORAGE_KEY);
  } catch {
    try {
      window.sessionStorage.setItem(DOCS_STORAGE_KEY, value);
    } catch {
      // Storage blocked
    }
  }
};

export const getDocumentation = (itemId: string): string => {
  const docs = readDocsFromStorage();
  return docs[itemId] || '';
};

export const hasDocumentation = (itemId: string): boolean => {
  const docs = readDocsFromStorage();
  return Boolean(docs[itemId] && docs[itemId].trim().length > 0);
};

const ChecklistDocumentationModal: React.FC<ChecklistDocumentationModalProps> = ({
  open,
  onOpenChange,
  itemId,
  itemLabel,
  defaultTemplate,
}) => {
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      const docs = readDocsFromStorage();
      const existingContent = docs[itemId];
      if (existingContent) {
        setContent(existingContent);
      } else {
        // Use template if available
        const template = defaultTemplate || DOCUMENTATION_TEMPLATES[itemId] || '';
        setContent(template);
      }
    }
  }, [open, itemId, defaultTemplate]);

  const handleSave = () => {
    const docs = readDocsFromStorage();
    docs[itemId] = content;
    persistDocsToStorage(docs);
    toast.success('Documentation saved');
    onOpenChange(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLoadTemplate = () => {
    const template = DOCUMENTATION_TEMPLATES[itemId];
    if (template) {
      setContent(template);
      toast.info('Template loaded');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentation: {itemLabel}
          </DialogTitle>
          <DialogDescription>
            Document your procedures for this checklist item. Use Markdown formatting.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 overflow-hidden">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your documentation here..."
            className="h-[400px] font-mono text-sm resize-none"
          />
        </div>

        <DialogFooter className="flex-shrink-0 gap-2 sm:gap-2">
          {DOCUMENTATION_TEMPLATES[itemId] && (
            <Button variant="outline" onClick={handleLoadTemplate}>
              Load Template
            </Button>
          )}
          <Button variant="outline" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Documentation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChecklistDocumentationModal;
