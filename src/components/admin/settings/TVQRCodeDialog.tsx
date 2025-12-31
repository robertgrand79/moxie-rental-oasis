import React from 'react';
import { QrCode, Download, Printer, Copy, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface TVQRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pairingCode: string;
  deviceName: string;
  propertyName: string;
}

const TVQRCodeDialog: React.FC<TVQRCodeDialogProps> = ({
  open,
  onOpenChange,
  pairingCode,
  deviceName,
  propertyName,
}) => {
  const [copied, setCopied] = React.useState(false);
  
  // Generate the pairing URL
  const pairingUrl = `${window.location.origin}/tv/pair?code=${pairingCode}`;
  
  // QR code API URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pairingUrl)}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(pairingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'URL copied to clipboard' });
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `tv-pairing-${pairingCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'QR code downloaded' });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>TV Pairing - ${deviceName}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
              text-align: center;
            }
            h1 { font-size: 24px; margin-bottom: 8px; }
            h2 { font-size: 18px; color: #666; margin-bottom: 32px; font-weight: normal; }
            img { max-width: 300px; margin-bottom: 24px; }
            .code { font-size: 48px; font-family: monospace; letter-spacing: 8px; margin-bottom: 16px; }
            .url { font-size: 14px; color: #666; word-break: break-all; max-width: 400px; }
            .instructions { margin-top: 32px; font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <h1>${deviceName}</h1>
          <h2>${propertyName}</h2>
          <img src="${qrCodeUrl}" alt="QR Code" />
          <div class="code">${pairingCode}</div>
          <p class="url">${pairingUrl}</p>
          <p class="instructions">Scan the QR code or enter the pairing code on your TV to connect.</p>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Pairing QR Code
          </DialogTitle>
          <DialogDescription>
            Scan this QR code on a mobile device to pair with {deviceName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-4 space-y-4">
          {/* QR Code */}
          <div className="bg-white p-4 rounded-lg">
            <img 
              src={qrCodeUrl} 
              alt="Pairing QR Code"
              className="w-48 h-48"
            />
          </div>

          {/* Pairing Code */}
          <div className="text-center w-full">
            <p className="text-sm text-muted-foreground mb-1">Pairing Code</p>
            <p className="text-2xl font-mono font-bold tracking-widest">{pairingCode}</p>
          </div>

          {/* Pairing URL */}
          <div className="w-full overflow-hidden">
            <p className="text-xs text-muted-foreground mb-2 text-center">Pairing URL</p>
            <div className="flex items-center gap-2 w-full">
              <code className="flex-1 text-xs bg-muted p-2 rounded truncate min-w-0">
                {pairingUrl}
              </code>
              <Button variant="outline" size="icon" className="flex-shrink-0" onClick={handleCopyUrl}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TVQRCodeDialog;
