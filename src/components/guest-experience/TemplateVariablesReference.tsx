import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Info, ChevronDown } from 'lucide-react';

const VARIABLE_GROUPS = [
  {
    title: 'Guest Information',
    variables: [
      { key: '{{guest_name}}', description: 'Full name of the primary guest' },
      { key: '{{guest_count}}', description: 'Number of guests in the reservation' },
    ],
  },
  {
    title: 'Property Details',
    variables: [
      { key: '{{property_name}}', description: 'Name/title of the property' },
      { key: '{{property_address}}', description: 'Full property address' },
    ],
  },
  {
    title: 'Dates & Times',
    variables: [
      { key: '{{check_in_date}}', description: 'Check-in date (formatted)' },
      { key: '{{check_out_date}}', description: 'Check-out date (formatted)' },
      { key: '{{check_in_time}}', description: 'Check-in time (e.g., 4:00 PM)' },
      { key: '{{check_out_time}}', description: 'Check-out time (e.g., 11:00 AM)' },
      { key: '{{nights_count}}', description: 'Number of nights staying' },
    ],
  },
  {
    title: 'Access Information',
    variables: [
      { key: '{{door_code}}', description: 'Door/lock access code' },
      { key: '{{wifi_network}}', description: 'WiFi network name' },
      { key: '{{wifi_password}}', description: 'WiFi password' },
    ],
  },
  {
    title: 'Links & Booking',
    variables: [
      { key: '{{guidebook_link}}', description: 'Link to digital guidebook' },
      { key: '{{confirmation_code}}', description: 'Reservation confirmation code' },
      { key: '{{total_amount}}', description: 'Total booking amount' },
    ],
  },
  {
    title: 'Company Information',
    variables: [
      { key: '{{company_name}}', description: 'Your company/brand name' },
      { key: '{{company_email}}', description: 'Contact email address' },
    ],
  },
];

const TemplateVariablesReference: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-between p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4" />
          <span>Template Variable Reference</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-3 p-4 bg-muted/30 rounded-lg space-y-4">
          <p className="text-sm text-muted-foreground">
            Use these variables in your templates. They'll be automatically replaced with actual guest and property data when emails are sent.
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {VARIABLE_GROUPS.map((group) => (
              <div key={group.title} className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {group.title}
                </h4>
                <div className="space-y-1.5">
                  {group.variables.map((v) => (
                    <div key={v.key} className="flex items-start gap-2">
                      <Badge variant="secondary" className="font-mono text-xs shrink-0">
                        {v.key}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{v.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default TemplateVariablesReference;
