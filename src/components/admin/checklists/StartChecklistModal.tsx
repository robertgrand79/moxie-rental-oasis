import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { ChecklistTemplate } from '@/hooks/useChecklistManagement';

interface StartChecklistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: ChecklistTemplate | null;
  onConfirm: (propertyId: string, period: string, dueDate?: string) => Promise<void>;
}

interface Property {
  id: string;
  title: string;
}

const StartChecklistModal = ({ open, onOpenChange, template, onConfirm }: StartChecklistModalProps) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [period, setPeriod] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      const { data } = await supabase.from('properties').select('id, title').order('title');
      setProperties((data || []) as Property[]);
    };
    if (open) {
      fetchProperties();
      // Set default period based on template type
      if (template) {
        const year = new Date().getFullYear();
        const defaultPeriods: Record<string, string> = {
          fall: `Fall ${year}`,
          spring: `Spring ${year}`,
          monthly: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
          quarterly: `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${year}`,
          custom: `${year}`,
        };
        setPeriod(defaultPeriods[template.type] || '');
      }
    }
  }, [open, template]);

  const handleSubmit = async () => {
    if (!selectedProperty || !period) return;
    setIsSubmitting(true);
    await onConfirm(selectedProperty, period, dueDate || undefined);
    setIsSubmitting(false);
    setSelectedProperty('');
    setPeriod('');
    setDueDate('');
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      fall: '🍂',
      spring: '🌷',
      monthly: '📅',
      quarterly: '📊',
      custom: '✏️',
    };
    return icons[type || ''] || '📋';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{getTypeIcon(template?.type || '')}</span>
            Start {template?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="property">Property</Label>
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger>
                <SelectValue placeholder="Select a property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="period">Period</Label>
            <Input
              id="period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="e.g., Fall 2024, Q1 2025"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date (optional)</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedProperty || !period || isSubmitting}>
            {isSubmitting ? 'Starting...' : 'Start Checklist'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StartChecklistModal;
