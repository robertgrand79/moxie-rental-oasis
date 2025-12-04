import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PlayCircle, ChevronDown, CheckCircle2 } from 'lucide-react';
import { ChecklistTemplate } from '@/hooks/useChecklistManagement';

interface ChecklistTemplateCardProps {
  template: ChecklistTemplate;
  onStart: () => void;
}

const ChecklistTemplateCard = ({ template, onStart }: ChecklistTemplateCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const items = template.items || [];
  const categories = [...new Set(items.map((item) => item.category))];
  const itemCount = items.length;

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      fall: '🍂',
      spring: '🌷',
      monthly: '📅',
      quarterly: '📊',
      custom: '✏️',
    };
    return icons[type] || '📋';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      fall: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      spring: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      monthly: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      quarterly: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      custom: 'bg-muted text-muted-foreground',
    };
    return colors[type] || 'bg-muted text-muted-foreground';
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getTypeIcon(template.type)}</span>
            <div>
              <CardTitle className="text-base">{template.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={getTypeColor(template.type)}>
                  {template.type}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {categories.length} categories • {itemCount} items
                </span>
              </div>
            </div>
          </div>
        </div>
        {template.description && (
          <p className="text-sm text-muted-foreground mt-2">{template.description}</p>
        )}
      </CardHeader>

      <CardContent className="flex-1 pt-0">
        <Accordion type="single" collapsible value={expanded ? 'items' : ''} onValueChange={(v) => setExpanded(!!v)}>
          <AccordionItem value="items" className="border-none">
            <AccordionTrigger className="py-2 text-sm hover:no-underline">
              <span className="flex items-center gap-2 text-muted-foreground">
                <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                View checklist items
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 mt-2">
                {categories.map((category) => (
                  <div key={category}>
                    <h4 className="font-medium text-sm text-foreground mb-2">{category}</h4>
                    <ul className="space-y-1">
                      {items
                        .filter((item) => item.category === category)
                        .map((item) => (
                          <li key={item.id} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 text-muted-foreground/50 flex-shrink-0" />
                            <span>{item.title}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Button onClick={onStart} className="w-full mt-4" size="sm">
          <PlayCircle className="h-4 w-4 mr-2" />
          Start Checklist
        </Button>
      </CardContent>
    </Card>
  );
};

export default ChecklistTemplateCard;
