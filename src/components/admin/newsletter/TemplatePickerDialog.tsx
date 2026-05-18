import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Loader2, Trash2 } from 'lucide-react';
import { useNewsletterTemplates, type NewsletterTemplate } from '@/hooks/useNewsletterTemplates';

interface TemplatePickerDialogProps {
  open: boolean;
  onClose: () => void;
  onPick: (template: NewsletterTemplate) => void;
}

export const TemplatePickerDialog: React.FC<TemplatePickerDialogProps> = ({ open, onClose, onPick }) => {
  const { templates, loading, deleteTemplate, markTemplateUsed } = useNewsletterTemplates();

  const handlePick = (template: NewsletterTemplate) => {
    void markTemplateUsed(template.id);
    onPick(template);
    onClose();
  };

  // Surface most-recently-used templates first; fall back to creation order.
  const sorted = [...templates].sort((a, b) => {
    const aTime = a.last_used_at ?? a.created_at;
    const bTime = b.last_used_at ?? b.created_at;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Start from a template</DialogTitle>
          <DialogDescription>
            Pick a saved template to pre-fill the subject, content, and cover image. You can
            edit everything before sending — the template stays unchanged.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No templates yet.</p>
            <p className="text-xs mt-1">Click "Save as Template" on any draft to add one.</p>
          </div>
        ) : (
          <ScrollArea className="flex-1 pr-2">
            <div className="space-y-2">
              {sorted.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-colors"
                >
                  {t.cover_image_url ? (
                    <img src={t.cover_image_url} alt="" className="w-16 h-16 object-cover rounded" />
                  ) : (
                    <div className="w-16 h-16 rounded bg-muted flex items-center justify-center">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{t.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{t.subject}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t.last_used_at
                        ? `Last used ${new Date(t.last_used_at).toLocaleDateString()}`
                        : `Created ${new Date(t.created_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => handlePick(t)}>Use</Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Delete template "${t.name}"? Drafts using it are unaffected.`)) {
                        void deleteTemplate(t.id);
                      }
                    }}
                    className="text-destructive hover:text-destructive"
                    aria-label="Delete template"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};
