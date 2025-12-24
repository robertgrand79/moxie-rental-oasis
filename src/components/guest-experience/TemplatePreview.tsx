import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye } from 'lucide-react';

interface TemplatePreviewProps {
  subject: string;
  content: string;
  companyName?: string;
}

// Sample data for preview
const SAMPLE_VARIABLES: Record<string, string> = {
  guest_name: 'Sarah Johnson',
  property_name: 'Oceanview Beach House',
  property_address: '123 Coastal Drive, Malibu, CA 90265',
  check_in_date: 'Saturday, January 15, 2025',
  check_out_date: 'Tuesday, January 18, 2025',
  check_in_time: '4:00 PM',
  check_out_time: '11:00 AM',
  nights_count: '3',
  guest_count: '4',
  door_code: '1234',
  wifi_network: 'BeachHouse_Guest',
  wifi_password: 'Welcome2024!',
  guidebook_link: '#',
  confirmation_code: 'BH123456',
  total_amount: '750.00',
  company_name: 'StayMoxie Rentals',
  company_email: 'hello@staymoxie.com',
};

function replaceVariables(text: string, variables: Record<string, string>): string {
  let result = text;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
}

function generatePreviewHtml(subject: string, content: string, companyName: string): string {
  const processedContent = replaceVariables(content, { ...SAMPLE_VARIABLES, company_name: companyName });
  const processedSubject = replaceVariables(subject, { ...SAMPLE_VARIABLES, company_name: companyName });
  
  // Convert line breaks to HTML
  const htmlContent = processedContent
    .split('\n')
    .map(line => {
      // Check for bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return `<li style="margin: 4px 0;">${line.replace(/^[\s•-]+/, '')}</li>`;
      }
      // Check for headers (lines in ALL CAPS or with emoji)
      if (line.trim().match(/^[A-Z📍🔐📶🕐📖✅📅]+[A-Z\s]+$/)) {
        return `<h3 style="margin: 20px 0 10px; color: #18181b; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">${line}</h3>`;
      }
      return line.trim() ? `<p style="margin: 8px 0; color: #52525b; font-size: 14px; line-height: 1.6;">${line}</p>` : '<br/>';
    })
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    ul { margin: 10px 0; padding-left: 20px; }
  </style>
</head>
<body style="background-color: #f4f4f5; padding: 20px;">
  <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
    <!-- Email Header -->
    <div style="background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.8) 100%); padding: 24px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 600;">${processedSubject}</h1>
    </div>
    
    <!-- Email Body -->
    <div style="padding: 24px;">
      ${htmlContent}
    </div>
    
    <!-- Footer -->
    <div style="background-color: #27272a; padding: 20px; text-align: center;">
      <p style="margin: 0; color: #71717a; font-size: 12px;">
        © ${new Date().getFullYear()} ${companyName || 'Your Company'}. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ 
  subject, 
  content, 
  companyName = 'Your Company' 
}) => {
  const previewHtml = useMemo(() => {
    if (!subject && !content) return null;
    return generatePreviewHtml(subject, content, companyName);
  }, [subject, content, companyName]);

  if (!previewHtml) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Eye className="h-8 w-8 text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">
            Enter subject and content to see a preview
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Email Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border-t">
          <iframe
            srcDoc={previewHtml}
            title="Email Preview"
            className="w-full h-[400px] border-0"
            sandbox="allow-same-origin"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplatePreview;
