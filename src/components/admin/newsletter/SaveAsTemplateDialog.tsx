import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useNewsletterTemplates } from '@/hooks/useNewsletterTemplates';

interface SaveAsTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  defaultName?: string;
  subject: string;
  content: string;
  coverImageUrl?: string | null;
}

export const SaveAsTemplateDialog: React.FC<SaveAsTemplateDialogProps> = ({
  open,
  onClose,
  defaultName = '',
  subject,
  content,
  coverImageUrl,
}) => {
  const [name, setName] = useState(defaultName);
  const [saving, setSaving] = useState(false);
  const { saveAsTemplate } = useNewsletterTemplates();

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const created = await saveAsTemplate({ name: name.trim(), subject, content, coverImageUrl });
    setSaving(false);
    if (created) {
      setName('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !saving && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
          <DialogDescription>
            Templates are reusable starting points for new newsletters. The current subject,
            content, and cover image will be saved.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="template-name">Template name</Label>
          <Input
            id="template-name"
            placeholder="e.g. Monthly Update"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={saving}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim() || saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
