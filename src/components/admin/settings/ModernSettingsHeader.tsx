import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatItem {
  label: string;
  value: string | number;
}

interface ModernSettingsHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  stats?: StatItem[];
  actions?: React.ReactNode;
  iconColor?: string;
  iconBgColor?: string;
}

const ModernSettingsHeader: React.FC<ModernSettingsHeaderProps> = ({
  icon: Icon,
  title,
  description,
  stats,
  actions,
  iconColor = 'text-primary',
  iconBgColor = 'bg-primary/10',
}) => {
  return (
    <div className="space-y-6">
      {/* Header with Icon */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${iconBgColor}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Stats Cards */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-lg p-4"
            >
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-semibold mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModernSettingsHeader;
