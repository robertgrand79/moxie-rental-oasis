import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Accessibility, Mail } from 'lucide-react';

const AccessibilityStatement: React.FC = () => {
  const accessibilityFeatures = [
    { feature: 'Keyboard Navigation', status: 'implemented', description: 'All interactive elements are accessible via keyboard' },
    { feature: 'Screen Reader Support', status: 'implemented', description: 'ARIA labels and semantic HTML throughout' },
    { feature: 'Color Contrast', status: 'implemented', description: 'WCAG AA compliant color contrast ratios' },
    { feature: 'Alt Text on Images', status: 'implemented', description: 'Descriptive alternative text for all images' },
    { feature: 'Form Labels', status: 'implemented', description: 'All form inputs have associated labels' },
    { feature: 'Focus Indicators', status: 'implemented', description: 'Visible focus states on interactive elements' },
    { feature: 'Responsive Design', status: 'implemented', description: 'Works on all screen sizes and devices' },
    { feature: 'Skip Links', status: 'partial', description: 'Skip to main content functionality' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Accessibility className="h-5 w-5" />
            Accessibility Statement
          </CardTitle>
          <CardDescription>
            Our commitment to digital accessibility and WCAG 2.1 compliance
          </CardDescription>
        </CardHeader>
        <CardContent className="prose prose-neutral dark:prose-invert max-w-none">
          <p>
            StayMoxie is committed to ensuring digital accessibility for people with disabilities. 
            We are continually improving the user experience for everyone, and applying the relevant 
            accessibility standards.
          </p>

          <h3>Conformance Status</h3>
          <p>
            The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and 
            developers to improve accessibility for people with disabilities. It defines three levels 
            of conformance: Level A, Level AA, and Level AAA. StayMoxie strives to conform to 
            <strong> WCAG 2.1 Level AA</strong>.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accessibility Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {accessibilityFeatures.map((item) => (
              <div 
                key={item.feature} 
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  {item.status === 'implemented' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-medium">{item.feature}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <Badge variant={item.status === 'implemented' ? 'default' : 'outline'}>
                  {item.status === 'implemented' ? 'Implemented' : 'In Progress'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Measures Taken</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            To ensure accessibility, StayMoxie has taken the following measures:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Included accessibility as part of our mission statement</li>
            <li>Integrated accessibility into our procurement practices</li>
            <li>Provided continual accessibility training for our staff</li>
            <li>Assigned clear accessibility goals and responsibilities</li>
            <li>Employed formal accessibility quality assurance methods</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assistive Technologies Supported</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="font-medium">Screen Readers</p>
              <p className="text-sm text-muted-foreground">NVDA, JAWS, VoiceOver, TalkBack</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="font-medium">Browsers</p>
              <p className="text-sm text-muted-foreground">Chrome, Firefox, Safari, Edge</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="font-medium">Operating Systems</p>
              <p className="text-sm text-muted-foreground">Windows, macOS, iOS, Android</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="font-medium">Input Methods</p>
              <p className="text-sm text-muted-foreground">Keyboard, touch, voice control</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Feedback & Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            We welcome your feedback on the accessibility of StayMoxie. Please let us know if you 
            encounter accessibility barriers:
          </p>
          <div className="space-y-2 text-muted-foreground">
            <p><strong>Email:</strong> accessibility@staymoxie.com</p>
            <p><strong>Response time:</strong> We try to respond within 2 business days</p>
          </div>
          <p className="text-sm text-muted-foreground">
            This statement was last updated on {new Date().toLocaleDateString()}.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessibilityStatement;
