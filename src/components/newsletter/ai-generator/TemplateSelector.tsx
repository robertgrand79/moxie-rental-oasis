
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Calendar, MapPin, Home, Star, AlertCircle } from 'lucide-react';
import { NewsletterTemplate } from './NewsletterTemplates';

interface TemplateSelectorProps {
  templates: NewsletterTemplate[];
  onTemplateSelect: (template: NewsletterTemplate) => void;
  isGenerating: boolean;
}

const iconMap = {
  'calendar': Calendar,
  'map-pin': MapPin,
  'home': Home,
  'star': Star,
};

const TemplateSelector = ({ templates, onTemplateSelect, isGenerating }: TemplateSelectorProps) => {
  // Debug logging
  console.log('TemplateSelector received templates:', templates?.length || 0);

  if (!templates || templates.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-lg">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No templates available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Choose from {templates.length} professional newsletter templates designed for Moxie Vacation Rentals
      </div>
      
      <div className="grid gap-4">
        {templates.map((template) => {
          const IconComponent = iconMap[template.icon as keyof typeof iconMap] || Calendar;
          
          return (
            <Card key={template.id} className="hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="mt-1 p-2 bg-blue-50 rounded-lg">
                      <IconComponent className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-lg text-gray-900">{template.title}</h4>
                        <Badge variant="outline" className="text-xs capitalize">
                          {template.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed mb-3">{template.description}</p>
                      <div className="text-xs text-gray-500">
                        Professional template with Moxie branding and Eugene expertise
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Button
                      onClick={() => {
                        console.log('Generating content for template:', template.title);
                        onTemplateSelect(template);
                      }}
                      disabled={isGenerating}
                      size="lg"
                      className="min-w-[120px]"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {isGenerating ? 'Generating...' : 'Generate'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TemplateSelector;
