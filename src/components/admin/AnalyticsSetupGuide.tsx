
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface AnalyticsSetupGuideProps {
  hasGoogleAnalytics: boolean;
  hasRealData: boolean;
}

const AnalyticsSetupGuide = ({ hasGoogleAnalytics, hasRealData }: AnalyticsSetupGuideProps) => {
  const setupSteps = [
    {
      title: 'Create Google Analytics Account',
      description: 'Set up a Google Analytics 4 property for your website',
      completed: hasGoogleAnalytics,
      link: 'https://analytics.google.com',
      action: 'Create Account'
    },
    {
      title: 'Get Measurement ID',
      description: 'Copy your GA4 Measurement ID (starts with G-)',
      completed: hasGoogleAnalytics,
      link: 'https://support.google.com/analytics/answer/9539598',
      action: 'Learn How'
    },
    {
      title: 'Configure in Site Settings',
      description: 'Add your Google Analytics ID to your site settings',
      completed: hasGoogleAnalytics,
      link: '/admin/settings',
      action: 'Configure Now'
    },
    {
      title: 'Verify Data Collection',
      description: 'Check that data is being collected properly',
      completed: hasRealData,
      link: 'https://analytics.google.com',
      action: 'Check Analytics'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Analytics Setup Guide
          {hasRealData ? (
            <Badge className="bg-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          ) : (
            <Badge variant="secondary">
              <AlertCircle className="h-3 w-3 mr-1" />
              Setup Required
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Follow these steps to connect real Google Analytics data to your dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasRealData && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              You're currently viewing demo analytics data. Set up Google Analytics to see real visitor data and insights.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {setupSteps.map((step, index) => (
            <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${
              step.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  step.completed 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {step.completed ? <CheckCircle className="h-3 w-3" /> : index + 1}
                </div>
                <div>
                  <p className="font-medium">{step.title}</p>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
              
              <Button 
                variant={step.completed ? "outline" : "default"} 
                size="sm"
                asChild
              >
                <a 
                  href={step.link} 
                  target={step.link.startsWith('http') ? '_blank' : '_self'}
                  rel={step.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-1"
                >
                  {step.action}
                  {step.link.startsWith('http') && <ExternalLink className="h-3 w-3" />}
                </a>
              </Button>
            </div>
          ))}
        </div>

        {hasRealData && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Great! Your analytics are properly configured and collecting real data.
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Alternative Analytics Options</h4>
          <div className="space-y-2 text-sm text-blue-800">
            <div>• <strong>Plausible Analytics:</strong> Privacy-focused, GDPR compliant</div>
            <div>• <strong>Vercel Analytics:</strong> If hosted on Vercel platform</div>
            <div>• <strong>Simple Analytics:</strong> Lightweight, cookie-free tracking</div>
            <div>• <strong>Matomo:</strong> Self-hosted analytics solution</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsSetupGuide;
