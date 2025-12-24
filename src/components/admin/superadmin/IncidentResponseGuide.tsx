import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle,
  XCircle,
  ArrowRight
} from 'lucide-react';

interface IncidentLevel {
  level: number;
  name: string;
  color: string;
  description: string;
  examples: string[];
  responseTime: string;
  actions: string[];
}

const incidentLevels: IncidentLevel[] = [
  {
    level: 1,
    name: 'Critical',
    color: 'bg-destructive',
    description: 'Complete service outage or data breach',
    examples: [
      'Database unreachable',
      'Payment processing down',
      'Security breach detected',
      'All users unable to login'
    ],
    responseTime: 'Immediate (< 15 minutes)',
    actions: [
      'Enable maintenance mode',
      'Notify all stakeholders immediately',
      'Begin incident bridge/war room',
      'Document timeline of events',
      'Implement fix or rollback'
    ]
  },
  {
    level: 2,
    name: 'High',
    color: 'bg-orange-500',
    description: 'Major feature broken affecting many users',
    examples: [
      'Booking flow broken',
      'Email notifications failing',
      'Significant performance degradation',
      'Guest sites not loading'
    ],
    responseTime: '< 1 hour',
    actions: [
      'Assess impact scope',
      'Notify affected stakeholders',
      'Create incident ticket',
      'Begin debugging',
      'Prepare rollback if needed'
    ]
  },
  {
    level: 3,
    name: 'Medium',
    color: 'bg-yellow-500',
    description: 'Feature partially broken or degraded',
    examples: [
      'Some emails delayed',
      'Minor UI bugs',
      'Slow page loads',
      'Non-critical integration issues'
    ],
    responseTime: '< 4 hours',
    actions: [
      'Log issue in bug tracker',
      'Assess priority',
      'Plan fix for next deploy',
      'Communicate ETA if needed'
    ]
  },
  {
    level: 4,
    name: 'Low',
    color: 'bg-blue-500',
    description: 'Minor issues or enhancement requests',
    examples: [
      'Typos in UI',
      'Minor styling issues',
      'Feature improvement requests',
      'Documentation updates'
    ],
    responseTime: 'Next business day',
    actions: [
      'Add to backlog',
      'Prioritize in next planning',
      'Acknowledge receipt'
    ]
  }
];

const emergencyContacts = [
  { role: 'Platform Lead', contact: 'platform-lead@staymoxie.com', availability: '24/7' },
  { role: 'Technical Lead', contact: 'tech-lead@staymoxie.com', availability: '24/7' },
  { role: 'Support Manager', contact: 'support@staymoxie.com', availability: 'Business hours' },
  { role: 'Security Team', contact: 'security@staymoxie.com', availability: '24/7 for critical' },
];

const IncidentResponseGuide: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Incident Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Incident Severity Levels
          </CardTitle>
          <CardDescription>
            Use these levels to classify and respond to incidents appropriately
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {incidentLevels.map((level) => (
            <div key={level.level} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={`${level.color} text-white`}>
                    P{level.level}
                  </Badge>
                  <span className="font-semibold">{level.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {level.responseTime}
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">{level.description}</p>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Examples:</p>
                  <ul className="text-sm space-y-1">
                    {level.examples.map((example, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <XCircle className="h-3 w-3 text-destructive flex-shrink-0" />
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Response Actions:</p>
                  <ul className="text-sm space-y-1">
                    {level.actions.map((action, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <ArrowRight className="h-3 w-3 text-primary flex-shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Emergency Contacts
          </CardTitle>
          <CardDescription>
            Contact list for critical issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {emergencyContacts.map((contact, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{contact.role}</div>
                    <div className="text-sm text-primary">{contact.contact}</div>
                  </div>
                </div>
                <Badge variant="outline">{contact.availability}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Incident Response Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Incident Response Checklist</CardTitle>
          <CardDescription>Steps to follow when handling an incident</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">1. Identify & Assess</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Determine the severity level</li>
                <li>• Identify affected users/systems</li>
                <li>• Document initial observations</li>
                <li>• Check monitoring dashboards</li>
              </ul>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">2. Communicate</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Notify appropriate team members</li>
                <li>• Update status page if needed</li>
                <li>• Inform affected customers</li>
                <li>• Set up communication channel</li>
              </ul>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">3. Mitigate</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Implement immediate fixes or workarounds</li>
                <li>• Consider rollback if appropriate</li>
                <li>• Enable maintenance mode if needed</li>
                <li>• Disable problematic features</li>
              </ul>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">4. Resolve</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Deploy permanent fix</li>
                <li>• Verify resolution</li>
                <li>• Monitor for recurrence</li>
                <li>• Confirm with affected users</li>
              </ul>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">5. Post-Incident</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Write incident report</li>
                <li>• Conduct post-mortem</li>
                <li>• Update runbooks</li>
                <li>• Implement preventive measures</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncidentResponseGuide;
