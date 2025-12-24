import React, { useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, QrCode, Printer } from 'lucide-react';

interface GuidebookQRCodeProps {
  propertyId: string;
  propertyTitle: string;
}

const GuidebookQRCode = ({ propertyId, propertyTitle }: GuidebookQRCodeProps) => {
  const printRef = useRef<HTMLDivElement>(null);
  
  // Generate the guidebook URL
  const baseUrl = window.location.origin;
  const guidebookUrl = `${baseUrl}/guest/guidebook/${propertyId}`;
  
  // Use a QR code API service
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(guidebookUrl)}`;

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Guidebook QR Code - ${propertyTitle}</title>
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
              box-sizing: border-box;
            }
            .container {
              text-align: center;
              border: 2px solid #e5e7eb;
              border-radius: 16px;
              padding: 40px;
              max-width: 400px;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 8px;
              color: #1f2937;
            }
            p {
              color: #6b7280;
              margin-bottom: 24px;
            }
            img {
              max-width: 250px;
              height: auto;
            }
            .instruction {
              margin-top: 24px;
              font-size: 14px;
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${propertyTitle}</h1>
            <p>Digital Guidebook</p>
            <img src="${qrCodeUrl}" alt="QR Code" />
            <p class="instruction">Scan this QR code to access the property guidebook</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `guidebook-qr-${propertyId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download QR code:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          QR Code for Physical Placement
        </CardTitle>
        <CardDescription>
          Print this QR code and place it in your property for easy guest access
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={printRef} className="flex flex-col items-center p-4 border rounded-lg bg-white">
          <h3 className="font-semibold text-lg mb-2">{propertyTitle}</h3>
          <p className="text-sm text-muted-foreground mb-4">Scan to view guidebook</p>
          <img 
            src={qrCodeUrl} 
            alt="Guidebook QR Code" 
            className="w-48 h-48"
          />
          <p className="text-xs text-muted-foreground mt-4 text-center max-w-xs">
            Point your phone camera at this code to open the digital guidebook
          </p>
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" onClick={handleDownload} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" onClick={handlePrint} className="flex-1">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          Guidebook URL: <code className="bg-muted px-1 rounded">{guidebookUrl}</code>
        </p>
      </CardContent>
    </Card>
  );
};

export default GuidebookQRCode;
