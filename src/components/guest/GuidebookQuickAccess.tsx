import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wifi, Key, Car, Copy, Check, Clock } from 'lucide-react';

interface QuickAccessProps {
  wifi?: {
    network: string;
    password: string;
  };
  doorCode?: string;
  parkingInstructions?: string;
  checkInTime?: string;
  checkOutTime?: string;
}

const GuidebookQuickAccess = ({ wifi, doorCode, parkingInstructions, checkInTime, checkOutTime }: QuickAccessProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const hasQuickInfo = wifi?.network || doorCode || parkingInstructions;

  if (!hasQuickInfo) return null;

  return (
    <div className="space-y-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Essentials</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* WiFi */}
        {wifi?.network && (
          <div className="rounded-2xl p-4 backdrop-blur-md bg-card/60 border border-border/20 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center">
                <Wifi className="h-4 w-4 text-primary" strokeWidth={1.5} />
              </div>
              <span className="text-sm font-medium">Wi-Fi</span>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1">Network</p>
                <div className="flex items-center gap-2">
                  <code className="bg-background/60 px-2.5 py-1.5 rounded-lg text-sm flex-1 font-mono">{wifi.network}</code>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full"
                    onClick={() => copyToClipboard(wifi.network, 'network')}
                  >
                    {copiedField === 'network' ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                  </Button>
                </div>
              </div>
              {wifi.password && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1">Password</p>
                  <div className="flex items-center gap-2">
                    <code className="bg-background/60 px-2.5 py-1.5 rounded-lg text-sm flex-1 font-mono">{wifi.password}</code>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full"
                      onClick={() => copyToClipboard(wifi.password, 'password')}
                    >
                      {copiedField === 'password' ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Door Code */}
        {doorCode && (
          <div className="rounded-2xl p-4 backdrop-blur-md bg-card/60 border border-border/20 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center">
                <Key className="h-4 w-4 text-primary" strokeWidth={1.5} />
              </div>
              <span className="text-sm font-medium">Door Code</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="bg-background/60 px-3 py-2.5 rounded-lg text-lg font-mono tracking-[0.15em] flex-1 text-center">
                {doorCode}
              </code>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full"
                onClick={() => copyToClipboard(doorCode, 'doorCode')}
              >
                {copiedField === 'doorCode' ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
              </Button>
            </div>
          </div>
        )}

        {/* Parking */}
        {parkingInstructions && (
          <div className="rounded-2xl p-4 backdrop-blur-md bg-card/60 border border-border/20 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center">
                <Car className="h-4 w-4 text-primary" strokeWidth={1.5} />
              </div>
              <span className="text-sm font-medium">Parking</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{parkingInstructions}</p>
          </div>
        )}

        {/* Check-in/out times */}
        {(checkInTime || checkOutTime) && (
          <div className="rounded-2xl p-4 backdrop-blur-md bg-card/60 border border-border/20 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center">
                <Clock className="h-4 w-4 text-primary" strokeWidth={1.5} />
              </div>
              <span className="text-sm font-medium">Times</span>
            </div>
            <div className="flex gap-6 text-sm">
              {checkInTime && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-0.5">Check-in</p>
                  <p className="font-medium">{checkInTime}</p>
                </div>
              )}
              {checkOutTime && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-0.5">Check-out</p>
                  <p className="font-medium">{checkOutTime}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuidebookQuickAccess;
