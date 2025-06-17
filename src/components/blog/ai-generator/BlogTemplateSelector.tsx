
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Calendar, MapPin, Home, Star } from 'lucide-react';
import { BlogTemplate } from './BlogTemplates';

interface BlogTemplateSelectorProps {
  templates: BlogTemplate[];
  onTemplateSelect: (template: BlogTemplate) => void;
  isGenerating: boolean;
}

const iconMap = {
  'calendar': Calendar,
  'map-pin': MapPin,
  'home': Home,
  'star': Star,
};

const BlogTemplateSelector = ({ templates, onTemplateSelect, isGenerating }: BlogTemplateSelectorProps) => {
  return (
    <div className="grid gap-4">
      {templates.map((template) => {
        const IconComponent = iconMap[template.icon as keyof typeof iconMap] || Calendar;
        
        return (
          <Card key={template.id} className="cursor-pointer hover:bg-gray-50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="mt-1">
                    <IconComponent className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-lg">{template.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{template.estimatedReadTime}</span>
                      <Badge variant="secondary" className="text-xs">
                        Blog Post
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => onTemplateSelect(template)}
                  disabled={isGenerating}
                  size="sm"
                  className="ml-4"
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

export default BlogTemplateSelector;
