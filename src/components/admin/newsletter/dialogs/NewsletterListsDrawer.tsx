import React, { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ListChecks,
  Plus,
  Loader2,
  Trash2,
  Users,
  TestTube2,
  ArrowLeft,
  UserPlus,
} from 'lucide-react';
import {
  useNewsletterLists,
  useNewsletterListMembers,
  type NewsletterList,
} from '@/hooks/useNewsletterLists';

interface NewsletterListsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewsletterListsDrawer: React.FC<NewsletterListsDrawerProps> = ({ open, onOpenChange }) => {
  const { lists, loading, createList, deleteList } = useNewsletterLists();
  const [view, setView] = useState<'list' | 'detail' | 'new'>('list');
  const [selectedList, setSelectedList] = useState<NewsletterList | null>(null);

  // "New list" form state.
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newIsTest, setNewIsTest] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    const created = await createList({ name: newName, description: newDescription, isTest: newIsTest });
    setCreating(false);
    if (created) {
      setNewName('');
      setNewDescription('');
      setNewIsTest(false);
      setSelectedList(created);
      setView('detail');
    }
  };

  return (
    <Drawer open={open} onOpenChange={(o) => { if (!o) { setView('list'); setSelectedList(null); } onOpenChange(o); }}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b pb-4">
          <DrawerTitle className="flex items-center gap-2">
            {view !== 'list' && (
              <Button variant="ghost" size="icon" onClick={() => { setView('list'); setSelectedList(null); }} className="h-7 w-7">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <ListChecks className="h-5 w-5" />
            {view === 'detail' && selectedList ? selectedList.name : view === 'new' ? 'New list' : 'Newsletter lists'}
          </DrawerTitle>
          <DrawerDescription>
            {view === 'detail' && selectedList
              ? selectedList.description || 'Manage who receives newsletters sent to this list.'
              : view === 'new'
              ? 'Create a named bucket of email addresses. Members can be existing subscribers or ad-hoc test addresses.'
              : 'Send to specific groups instead of all active subscribers. Useful for testing (small QA list) or targeting (VIPs, region, etc).'}
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto p-6 max-h-[calc(90vh-100px)]">
          {view === 'list' && (
            <ListsIndex
              lists={lists}
              loading={loading}
              onOpen={(l) => { setSelectedList(l); setView('detail'); }}
              onDelete={deleteList}
              onNew={() => setView('new')}
            />
          )}

          {view === 'new' && (
            <div className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="list-name">Name</Label>
                <Input
                  id="list-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Internal QA"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="list-desc">Description (optional)</Label>
                <Textarea
                  id="list-desc"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Who's on this list and why?"
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="list-is-test"
                  checked={newIsTest}
                  onCheckedChange={(c) => setNewIsTest(c === true)}
                />
                <Label htmlFor="list-is-test" className="text-sm font-normal cursor-pointer">
                  This is a test list (surfaced in test-send picker)
                </Label>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setView('list')}>Cancel</Button>
                <Button onClick={handleCreate} disabled={!newName.trim() || creating}>
                  {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create list
                </Button>
              </div>
            </div>
          )}

          {view === 'detail' && selectedList && (
            <ListDetail list={selectedList} />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

const ListsIndex: React.FC<{
  lists: NewsletterList[];
  loading: boolean;
  onOpen: (l: NewsletterList) => void;
  onDelete: (id: string) => Promise<boolean>;
  onNew: () => void;
}> = ({ lists, loading, onOpen, onDelete, onNew }) => {
  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }
  return (
    <div className="space-y-3">
      <Button onClick={onNew} className="w-full sm:w-auto">
        <Plus className="h-4 w-4 mr-2" />
        New list
      </Button>

      {lists.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <ListChecks className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No lists yet.</p>
          <p className="text-xs mt-1">Create one to send to a subset of recipients instead of all subscribers.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {lists.map(l => (
            <div
              key={l.id}
              className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary/50 hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => onOpen(l)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium truncate">{l.name}</p>
                  {l.is_test && (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      <TestTube2 className="h-3 w-3 mr-1" />
                      Test
                    </Badge>
                  )}
                </div>
                {l.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{l.description}</p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {l.member_count ?? 0} member{(l.member_count ?? 0) === 1 ? '' : 's'}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete list "${l.name}"? Members are removed from the list but subscriber rows are untouched.`)) {
                    void onDelete(l.id);
                  }
                }}
                className="text-destructive hover:text-destructive"
                aria-label="Delete list"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ListDetail: React.FC<{ list: NewsletterList }> = ({ list }) => {
  const { members, loading, addMembers, removeMember } = useNewsletterListMembers(list.id);
  const [showAdd, setShowAdd] = useState(false);
  const [emailsInput, setEmailsInput] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!emailsInput.trim()) return;
    setAdding(true);
    const count = await addMembers(emailsInput);
    setAdding(false);
    if (count > 0) {
      setEmailsInput('');
      setShowAdd(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {members.length} member{members.length === 1 ? '' : 's'}
        </p>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add members
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : members.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No members yet.</p>
        </div>
      ) : (
        <ScrollArea className="max-h-[50vh]">
          <div className="border rounded-lg divide-y">
            {members.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-3 hover:bg-muted/30">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.email}</p>
                  {m.name && <p className="text-xs text-muted-foreground truncate">{m.name}</p>}
                </div>
                {m.subscriber_id ? (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    Subscriber
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">Non-subscriber</Badge>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => void removeMember(m.id)}
                  className="text-destructive hover:text-destructive"
                  aria-label="Remove member"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      <Dialog open={showAdd} onOpenChange={(o) => !o && !adding && setShowAdd(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add members to "{list.name}"</DialogTitle>
            <DialogDescription>
              One email per line, or paste a comma/space-separated list. Existing subscribers are
              automatically linked; non-subscriber addresses are added as ad-hoc members (useful for
              test addresses).
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={emailsInput}
            onChange={(e) => setEmailsInput(e.target.value)}
            placeholder={'alice@example.com\nbob@example.com'}
            rows={6}
            disabled={adding}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)} disabled={adding}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!emailsInput.trim() || adding}>
              {adding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewsletterListsDrawer;
