import React, { useState, useMemo } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Search, ShieldOff, Trash2, AlertCircle } from 'lucide-react';
import { useNewsletterSuppression, type SuppressionReason } from '@/hooks/useNewsletterSuppression';

interface NewsletterSuppressionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const reasonLabel: Record<SuppressionReason, string> = {
  hard_bounce: 'Hard bounce',
  soft_bounce: 'Soft bounce',
  complaint: 'Spam complaint',
  unsubscribed: 'Unsubscribed',
  manual: 'Added manually',
};

const reasonColor: Record<SuppressionReason, string> = {
  hard_bounce: 'bg-red-100 text-red-800',
  soft_bounce: 'bg-orange-100 text-orange-800',
  complaint: 'bg-red-100 text-red-800',
  unsubscribed: 'bg-slate-100 text-slate-800',
  manual: 'bg-blue-100 text-blue-800',
};

const NewsletterSuppressionDrawer: React.FC<NewsletterSuppressionDrawerProps> = ({ open, onOpenChange }) => {
  const { entries, loading, addManual, remove } = useNewsletterSuppression();
  const [newEmail, setNewEmail] = useState('');
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(e => e.email.toLowerCase().includes(q) || e.reason.includes(q));
  }, [entries, query]);

  const handleAdd = async () => {
    if (!newEmail.trim()) return;
    setAdding(true);
    const ok = await addManual(newEmail);
    setAdding(false);
    if (ok) setNewEmail('');
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b pb-4">
          <DrawerTitle className="flex items-center gap-2">
            <ShieldOff className="h-5 w-5" />
            Suppression list
          </DrawerTitle>
          <DrawerDescription>
            Addresses on this list never receive newsletters from your org. Hard bounces and spam
            complaints land here automatically via the Resend webhook; you can also add or remove
            entries manually.
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto p-6 max-h-[calc(90vh-100px)] space-y-4">
          {/* Add manual */}
          <div className="flex gap-2">
            <Input
              placeholder="email@example.com"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
              disabled={adding}
            />
            <Button onClick={handleAdd} disabled={!newEmail.trim() || adding}>
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              <span className="ml-2">Add</span>
            </Button>
          </div>

          {/* Search */}
          {entries.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email or reason..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          )}

          {/* List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No suppressed addresses yet.</p>
              <p className="text-xs mt-1">
                Hard bounces and spam complaints will appear here automatically once Resend
                webhooks are configured.
              </p>
            </div>
          ) : (
            <div className="border rounded-lg divide-y">
              {filtered.map(entry => (
                <div key={entry.id} className="flex items-center gap-3 p-3 hover:bg-muted/30">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">{entry.email}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(entry.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline" className={`text-xs ${reasonColor[entry.reason]}`}>
                    {reasonLabel[entry.reason]}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Remove ${entry.email} from suppression list? Future newsletters will reach them again.`)) {
                        void remove(entry.id);
                      }
                    }}
                    className="text-destructive hover:text-destructive"
                    aria-label="Remove from suppression"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="p-6 text-center text-sm text-muted-foreground">No matches for "{query}".</p>
              )}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default NewsletterSuppressionDrawer;
