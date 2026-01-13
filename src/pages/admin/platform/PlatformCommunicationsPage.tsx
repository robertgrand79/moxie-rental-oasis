import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { usePlatformCommunications, CreateAnnouncementInput, PlatformAnnouncement } from '@/hooks/usePlatformCommunications';
import { Plus, Send, Megaphone, Mail, Bell, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const TIERS = ['starter', 'professional', 'enterprise'];

const TYPE_ICONS = {
  announcement: Megaphone,
  campaign: Mail,
  banner: Bell,
};

const PRIORITY_COLORS = {
  low: 'bg-gray-500',
  normal: 'bg-blue-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
};

function AnnouncementForm({ 
  onSubmit, 
  defaultType = 'announcement',
  tierStats,
}: { 
  onSubmit: (data: CreateAnnouncementInput) => void;
  defaultType?: 'announcement' | 'campaign' | 'banner';
  tierStats: Record<string, number>;
}) {
  const [form, setForm] = useState<CreateAnnouncementInput>({
    title: '',
    content: '',
    announcement_type: defaultType,
    target_tiers: [],
    priority: 'normal',
    banner_style: 'info',
    email_subject: '',
    cta_text: '',
    cta_url: '',
  });

  const toggleTier = (tier: string) => {
    setForm(prev => ({
      ...prev,
      target_tiers: prev.target_tiers.includes(tier)
        ? prev.target_tiers.filter(t => t !== tier)
        : [...prev.target_tiers, tier],
    }));
  };

  const totalTargeted = form.target_tiers.length === 0 
    ? Object.values(tierStats).reduce((a, b) => a + b, 0)
    : form.target_tiers.reduce((sum, tier) => sum + (tierStats[tier] || 0), 0);

  return (
    <div className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
      </div>
      <div>
        <Label>Content</Label>
        <Textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={4} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Type</Label>
          <Select value={form.announcement_type} onValueChange={(v: any) => setForm(p => ({ ...p, announcement_type: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="announcement">Announcement</SelectItem>
              <SelectItem value="campaign">Email Campaign</SelectItem>
              <SelectItem value="banner">In-App Banner</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Priority</Label>
          <Select value={form.priority} onValueChange={(v: any) => setForm(p => ({ ...p, priority: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {form.announcement_type === 'banner' && (
        <div>
          <Label>Banner Style</Label>
          <Select value={form.banner_style} onValueChange={(v: any) => setForm(p => ({ ...p, banner_style: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="info">Info (Blue)</SelectItem>
              <SelectItem value="success">Success (Green)</SelectItem>
              <SelectItem value="warning">Warning (Yellow)</SelectItem>
              <SelectItem value="error">Error (Red)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      {form.announcement_type === 'campaign' && (
        <div>
          <Label>Email Subject</Label>
          <Input value={form.email_subject || ''} onChange={e => setForm(p => ({ ...p, email_subject: e.target.value }))} />
        </div>
      )}
      <div>
        <Label>Target Tiers (empty = all)</Label>
        <div className="flex gap-4 mt-2">
          {TIERS.map(tier => (
            <label key={tier} className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={form.target_tiers.includes(tier)} onCheckedChange={() => toggleTier(tier)} />
              <span className="capitalize">{tier}</span>
              <span className="text-muted-foreground text-sm">({tierStats[tier] || 0})</span>
            </label>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-1">Will target {totalTargeted} organizations</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>CTA Text (optional)</Label>
          <Input value={form.cta_text || ''} onChange={e => setForm(p => ({ ...p, cta_text: e.target.value }))} placeholder="Learn More" />
        </div>
        <div>
          <Label>CTA URL (optional)</Label>
          <Input value={form.cta_url || ''} onChange={e => setForm(p => ({ ...p, cta_url: e.target.value }))} placeholder="https://..." />
        </div>
      </div>
      <Button onClick={() => onSubmit(form)} className="w-full">Create</Button>
    </div>
  );
}

function AnnouncementCard({ 
  announcement, 
  onToggle, 
  onDelete, 
  onSendCampaign,
  isSending,
}: { 
  announcement: PlatformAnnouncement;
  onToggle: () => void;
  onDelete: () => void;
  onSendCampaign: () => void;
  isSending: boolean;
}) {
  const Icon = TYPE_ICONS[announcement.announcement_type];
  
  return (
    <Card className={!announcement.is_active ? 'opacity-60' : ''}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-muted rounded">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-medium">{announcement.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{announcement.content}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{announcement.announcement_type}</Badge>
                <Badge className={PRIORITY_COLORS[announcement.priority]}>{announcement.priority}</Badge>
                {announcement.target_tiers.length > 0 && (
                  <Badge variant="secondary">{announcement.target_tiers.join(', ')}</Badge>
                )}
                {announcement.email_sent_at && (
                  <Badge variant="outline" className="text-green-600">
                    Sent to {announcement.email_sent_count}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Created {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Button variant="ghost" size="icon" onClick={onToggle} title={announcement.is_active ? 'Deactivate' : 'Activate'}>
              {announcement.is_active ? <ToggleRight className="h-4 w-4 text-green-500" /> : <ToggleLeft className="h-4 w-4" />}
            </Button>
            {announcement.announcement_type === 'campaign' && !announcement.email_sent_at && (
              <Button variant="ghost" size="icon" onClick={onSendCampaign} disabled={isSending} title="Send Campaign">
                <Send className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onDelete} title="Delete">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PlatformCommunicationsPage() {
  const { announcements, tierStats, createAnnouncement, updateAnnouncement, deleteAnnouncement, sendCampaignEmail } = usePlatformCommunications();
  const [dialogOpen, setDialogOpen] = useState(false);

  const activeCount = announcements.filter(a => a.is_active).length;
  const campaignsSent = announcements.filter(a => a.email_sent_at).length;

  const filterByType = (type: string) => announcements.filter(a => a.announcement_type === type);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Communications Hub</h1>
          <p className="text-muted-foreground">Announcements, campaigns, and in-app banners</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> New Communication</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create Communication</DialogTitle></DialogHeader>
            <AnnouncementForm 
              tierStats={tierStats} 
              onSubmit={(data) => {
                createAnnouncement.mutate(data);
                setDialogOpen(false);
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><span className="text-2xl font-bold">{announcements.length}</span><p className="text-sm text-muted-foreground">Total</p></CardContent></Card>
        <Card><CardContent className="pt-4"><span className="text-2xl font-bold">{activeCount}</span><p className="text-sm text-muted-foreground">Active</p></CardContent></Card>
        <Card><CardContent className="pt-4"><span className="text-2xl font-bold">{campaignsSent}</span><p className="text-sm text-muted-foreground">Campaigns Sent</p></CardContent></Card>
        <Card><CardContent className="pt-4"><span className="text-2xl font-bold">{Object.values(tierStats).reduce((a, b) => a + b, 0)}</span><p className="text-sm text-muted-foreground">Total Orgs</p></CardContent></Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({announcements.length})</TabsTrigger>
          <TabsTrigger value="announcement">Announcements ({filterByType('announcement').length})</TabsTrigger>
          <TabsTrigger value="campaign">Campaigns ({filterByType('campaign').length})</TabsTrigger>
          <TabsTrigger value="banner">Banners ({filterByType('banner').length})</TabsTrigger>
        </TabsList>

        {['all', 'announcement', 'campaign', 'banner'].map(tab => (
          <TabsContent key={tab} value={tab} className="mt-4 space-y-3">
            {(tab === 'all' ? announcements : filterByType(tab)).map(a => (
              <AnnouncementCard
                key={a.id}
                announcement={a}
                onToggle={() => updateAnnouncement.mutate({ id: a.id, is_active: !a.is_active })}
                onDelete={() => deleteAnnouncement.mutate(a.id)}
                onSendCampaign={() => sendCampaignEmail.mutate(a.id)}
                isSending={sendCampaignEmail.isPending}
              />
            ))}
            {(tab === 'all' ? announcements : filterByType(tab)).length === 0 && (
              <p className="text-muted-foreground text-center py-8">No communications yet</p>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
