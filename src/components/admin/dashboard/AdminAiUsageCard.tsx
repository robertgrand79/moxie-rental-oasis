import React from 'react';
import { Sparkles, MessageCircle, Inbox, FileText, Wand2, ShieldAlert } from 'lucide-react';
import { useAiUsage, type AiSurface, type SurfaceUsage } from '@/hooks/useAiUsage';

const SURFACE_ICONS: Record<AiSurface, React.ComponentType<{ className?: string }>> = {
  public_guest_chat: MessageCircle,
  guest_inbox_reply: Inbox,
  admin_assistant: Wand2,
  admin_content_gen: FileText,
};

const SURFACE_COLORS: Record<AiSurface, { fg: string; bg: string }> = {
  public_guest_chat: { fg: 'text-sky-600', bg: 'bg-sky-500/10' },
  guest_inbox_reply: { fg: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  admin_assistant: { fg: 'text-violet-600', bg: 'bg-violet-500/10' },
  admin_content_gen: { fg: 'text-amber-600', bg: 'bg-amber-500/10' },
};

function formatNumber(n: number): string {
  return n.toLocaleString();
}

function Sparkline({ data, color }: { data: { count: number }[]; color: string }) {
  const values = data.map(d => d.count);
  const max = Math.max(1, ...values);
  const w = 96;
  const h = 24;
  const barW = w / values.length;
  return (
    <svg width={w} height={h} className="block" aria-hidden="true">
      {values.map((v, i) => {
        const barH = Math.max(1, (v / max) * (h - 2));
        return (
          <rect
            key={i}
            x={i * barW + 0.5}
            y={h - barH}
            width={Math.max(1, barW - 1)}
            height={barH}
            className={color}
          />
        );
      })}
    </svg>
  );
}

function SurfaceTile({ s }: { s: SurfaceUsage }) {
  const Icon = SURFACE_ICONS[s.surface];
  const colors = SURFACE_COLORS[s.surface];
  return (
    <div className="flex flex-col p-4 rounded-xl border bg-card">
      <div className="flex items-center justify-between mb-3">
        <div className={`h-9 w-9 rounded-lg ${colors.bg} flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${colors.fg}`} />
        </div>
        <Sparkline data={s.daily14} color={colors.fg.replace('text-', 'fill-')} />
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-bold text-foreground">{formatNumber(s.monthAllowed)}</span>
        {s.monthBlocked > 0 && (
          <span className="text-xs text-destructive">
            +{formatNumber(s.monthBlocked)} blocked
          </span>
        )}
      </div>

      <p className="text-sm font-medium text-foreground">{s.label}</p>
      <p className="text-xs text-muted-foreground mt-0.5">
        {formatNumber(s.rpmLimit)}/min · {formatNumber(s.rpdLimit)}/day
      </p>
    </div>
  );
}

const AdminAiUsageCard = () => {
  const { data, loading, error } = useAiUsage();

  if (loading) {
    return (
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          AI Usage This Month
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="h-32 rounded-xl border bg-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          AI Usage This Month
        </h2>
        <div className="text-xs text-muted-foreground">
          {formatNumber(data.monthAllowedTotal)} requests
          {data.monthBlockedTotal > 0 && (
            <span className="ml-2 text-destructive inline-flex items-center gap-1">
              <ShieldAlert className="h-3 w-3" />
              {formatNumber(data.monthBlockedTotal)} rate-limited
            </span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {data.perSurface.map(s => (
          <SurfaceTile key={s.surface} s={s} />
        ))}
      </div>
    </div>
  );
};

export default AdminAiUsageCard;
