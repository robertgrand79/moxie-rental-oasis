import React from 'react';
import { AlertCircle, TrendingUp, Zap, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAIRateLimits } from '@/hooks/useAIRateLimits';
import { cn } from '@/lib/utils';

interface AIUsageDisplayProps {
  compact?: boolean;
}

export function AIUsageDisplay({ compact = false }: AIUsageDisplayProps) {
  const {
    usageStats,
    isLoading,
    isNearLimit,
    isAtLimit,
    canUpgrade,
    tierDisplayName,
    nextTier,
  } = useAIRateLimits();

  if (isLoading) {
    return (
      <Card className={cn(compact && "border-0 shadow-none")}>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-2 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-1/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!usageStats) {
    return null;
  }

  const progressColor = isAtLimit 
    ? 'bg-destructive' 
    : isNearLimit 
      ? 'bg-amber-500' 
      : 'bg-primary';

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-medium">AI Usage</span>
            <Badge variant="outline" className="text-xs">{tierDisplayName}</Badge>
          </div>
          <span className="text-muted-foreground">
            {usageStats.daily_used} / {usageStats.daily_limit} today
          </span>
        </div>
        <Progress 
          value={usageStats.usage_percentage} 
          className={cn("h-2", `[&>div]:${progressColor}`)}
        />
        {isAtLimit && (
          <p className="text-xs text-destructive">
            Daily limit reached. Resets in 24 hours.
          </p>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              AI Usage
            </CardTitle>
            <CardDescription>
              Monitor your AI assistant usage and limits
            </CardDescription>
          </div>
          <Badge 
            variant={isAtLimit ? "destructive" : isNearLimit ? "outline" : "secondary"}
            className="text-sm"
          >
            {tierDisplayName} Plan
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Daily Usage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Daily Requests</span>
            <span className="text-sm text-muted-foreground">
              {usageStats.daily_used} of {usageStats.daily_limit} used
            </span>
          </div>
          <Progress 
            value={usageStats.usage_percentage} 
            className={cn("h-3", `[&>div]:${progressColor}`)}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{usageStats.daily_remaining} remaining</span>
            <span>Resets daily</span>
          </div>
        </div>

        {/* Rate Limit Info */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold">{usageStats.daily_limit}</div>
            <div className="text-xs text-muted-foreground">Daily limit</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold">{usageStats.per_minute_limit}</div>
            <div className="text-xs text-muted-foreground">Per minute</div>
          </div>
        </div>

        {/* Warnings */}
        {isAtLimit && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Daily Limit Reached</AlertTitle>
            <AlertDescription>
              You've reached your daily AI request limit. The limit will reset in 24 hours.
              {canUpgrade && " Upgrade your plan for more requests."}
            </AlertDescription>
          </Alert>
        )}

        {isNearLimit && !isAtLimit && (
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertTitle>Approaching Limit</AlertTitle>
            <AlertDescription>
              You've used {usageStats.usage_percentage.toFixed(0)}% of your daily AI requests.
              {canUpgrade && ` Consider upgrading to ${nextTier} for more.`}
            </AlertDescription>
          </Alert>
        )}

        {/* Upgrade CTA */}
        {canUpgrade && (
          <div className="pt-2">
            <Button variant="outline" className="w-full group" asChild>
              <a href="/admin/subscription">
                <span>Upgrade to {nextTier}</span>
                <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AIUsageDisplay;
