import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wifi, Key, Car, Copy, Check } from 'lucide-react';
import { useState } from 'react';

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
    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
      <CardContent className="p-4">
        <h3 className="font-semibold mb-4 text-lg">Quick Access</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* WiFi */}
          {wifi?.network && (
            <div className="bg-background rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <Wifi className="h-5 w-5" />
                <span className="font-medium">WiFi</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Network</p>
                <div className="flex items-center gap-2">
                  <code className="bg-muted px-2 py-1 rounded text-sm flex-1">{wifi.network}</code>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => copyToClipboard(wifi.network, 'network')}
                  >
                    {copiedField === 'network' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              {wifi.password && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Password</p>
                  <div className="flex items-center gap-2">
                    <code className="bg-muted px-2 py-1 rounded text-sm flex-1">{wifi.password}</code>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => copyToClipboard(wifi.password, 'password')}
                    >
                      {copiedField === 'password' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Door Code */}
          {doorCode && (
            <div className="bg-background rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <Key className="h-5 w-5" />
                <span className="font-medium">Door Code</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="bg-muted px-3 py-2 rounded text-lg font-mono tracking-wider flex-1 text-center">
                  {doorCode}
                </code>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => copyToClipboard(doorCode, 'doorCode')}
                >
                  {copiedField === 'doorCode' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          {/* Parking */}
          {parkingInstructions && (
            <div className="bg-background rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <Car className="h-5 w-5" />
                <span className="font-medium">Parking</span>
              </div>
              <p className="text-sm text-muted-foreground">{parkingInstructions}</p>
            </div>
          )}
        </div>

        {/* Check-in/out times */}
        {(checkInTime || checkOutTime) && (
          <div className="flex gap-4 mt-4 pt-4 border-t border-border/50">
            {checkInTime && (
              <div className="text-sm">
                <span className="text-muted-foreground">Check-in: </span>
                <span className="font-medium">{checkInTime}</span>
              </div>
            )}
            {checkOutTime && (
              <div className="text-sm">
                <span className="text-muted-foreground">Check-out: </span>
                <span className="font-medium">{checkOutTime}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GuidebookQuickAccess;
