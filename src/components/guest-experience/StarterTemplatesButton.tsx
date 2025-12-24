import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { PackagePlus, Loader2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StarterTemplate {
  name: string;
  category: string;
  subject: string;
  content: string;
}

const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    name: 'Check-in Reminder (24hrs)',
    category: 'checkin_reminder',
    subject: 'Your Stay at {{property_name}} Starts Tomorrow! 🌟',
    content: `Hi {{guest_name}},

We're excited to welcome you to {{property_name}} tomorrow!

📅 Check-in Date: {{check_in_date}}
🕐 Check-in Time: {{check_in_time}}
📍 Address: {{property_address}}

You'll receive detailed check-in instructions with access codes shortly. The property will be ready and waiting for your arrival.

If you have any questions before you arrive, please don't hesitate to reach out.

Safe travels!`,
  },
  {
    name: 'Check-in Instructions',
    category: 'checkin_instructions',
    subject: '🔑 Your Check-in Instructions for {{property_name}}',
    content: `Hi {{guest_name}},

Here are your check-in instructions for {{property_name}}:

📍 ADDRESS
{{property_address}}

🔐 ACCESS INFORMATION
Door Code: {{door_code}}

📶 WIFI
Network: {{wifi_network}}
Password: {{wifi_password}}

🕐 CHECK-IN TIME
{{check_in_time}} or later

📖 PROPERTY GUIDEBOOK
View all property details and local recommendations: {{guidebook_link}}

If you have any trouble accessing the property, please contact us immediately.

We hope you have a wonderful stay!`,
  },
  {
    name: 'Check-out Reminder',
    category: 'checkout_reminder',
    subject: 'Check-out Reminder for {{property_name}} 🏠',
    content: `Hi {{guest_name}},

We hope you enjoyed your stay at {{property_name}}! Just a friendly reminder that check-out is today.

🕐 CHECK-OUT TIME
{{check_out_time}}

✅ CHECK-OUT CHECKLIST
• Please leave keys/key cards in the designated location
• Run the dishwasher if dishes are dirty
• Place used towels in the laundry area
• Turn off all lights and lock all doors
• Ensure all windows are closed

Thank you for being a wonderful guest! We truly appreciate you choosing to stay with us.

Safe travels, and we hope to see you again soon!`,
  },
  {
    name: 'Review Request',
    category: 'review_request',
    subject: 'How Was Your Stay at {{property_name}}? ⭐',
    content: `Hi {{guest_name}},

We hope you had an amazing time at {{property_name}}!

Your feedback means the world to us and helps future guests know what to expect. Would you mind taking a moment to share your experience?

⭐⭐⭐⭐⭐

Your review helps us:
• Improve our hospitality
• Assist future guests in making decisions
• Recognize what we're doing right

Thank you for being an amazing guest! We truly appreciate your time and hope to welcome you back again soon.

Warm regards,
{{company_name}}`,
  },
];

interface StarterTemplatesButtonProps {
  existingCategories: string[];
}

const StarterTemplatesButton: React.FC<StarterTemplatesButtonProps> = ({ existingCategories }) => {
  const [added, setAdded] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const missingTemplates = STARTER_TEMPLATES.filter(
    (t) => !existingCategories.includes(t.category)
  );

  const addMutation = useMutation({
    mutationFn: async () => {
      if (missingTemplates.length === 0) return;

      const templatesWithDefaults = missingTemplates.map((t) => ({
        ...t,
        is_default: true,
        is_active: true,
        property_id: null,
      }));

      const { error } = await supabase
        .from('message_templates')
        .insert(templatesWithDefaults);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
      toast({ 
        title: 'Starter templates added!', 
        description: `Added ${missingTemplates.length} professional email templates.`
      });
      setAdded(true);
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Error adding templates', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  if (missingTemplates.length === 0 || added) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline" 
            onClick={() => addMutation.mutate()}
            disabled={addMutation.isPending}
          >
            {addMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : addMutation.isSuccess ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <PackagePlus className="h-4 w-4 mr-2" />
            )}
            Add Starter Templates ({missingTemplates.length})
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p>Add professional email templates for check-in reminders, check-in instructions, check-out reminders, and review requests.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default StarterTemplatesButton;
