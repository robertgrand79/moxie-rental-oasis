
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Calendar, MapPin, Home, Star } from 'lucide-react';
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
  return (
    <div className="grid gap-3">
      {templates.map((template) => {
        const IconComponent = iconMap[template.icon as keyof typeof iconMap] || Calendar;
        
        return (
          <Card key={template.id} className="cursor-pointer hover:bg-gray-50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="mt-1">
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{template.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  </div>
                </div>
                <Button
                  onClick={() => onTemplateSelect(template)}
                  disabled={isGenerating}
                  size="sm"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Generate
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default TemplateSelector;
