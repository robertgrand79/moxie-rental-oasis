import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Home, Building2, Info, Compass, Calendar, BookOpen, Mail, FileText } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigationConfig } from '@/hooks/useNavigationConfig';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import type { NavigationItemConfig } from '@/types/navigation';

const iconMap: Record<string, React.ElementType> = {
  home: Home,
  properties: Building2,
  about: Info,
  explore: Compass,
  events: Calendar,
  blog: BookOpen,
  contact: Mail,
};

interface SortableNavItemProps {
  item: NavigationItemConfig;
  onToggle: (id: string, enabled: boolean) => void;
  onLabelChange: (id: string, label: string) => void;
}

const SortableNavItem: React.FC<SortableNavItemProps> = ({ item, onToggle, onLabelChange }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = item.type === 'core' ? (iconMap[item.id] || FileText) : FileText;
  const displayLabel = item.customLabel || item.originalTitle || item.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-card border border-border rounded-lg ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      
      <Icon className="h-5 w-5 text-muted-foreground" />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Input
            value={item.customLabel || ''}
            onChange={(e) => onLabelChange(item.id, e.target.value)}
            placeholder={item.originalTitle || item.id}
            className="h-8 text-sm"
          />
          {item.type === 'core' && (
            <Badge variant="secondary" className="shrink-0 text-xs">
              Core
            </Badge>
          )}
          {item.type === 'custom' && (
            <Badge variant="outline" className="shrink-0 text-xs">
              Page
            </Badge>
          )}
        </div>
      </div>
      
      <Switch
        checked={item.enabled}
        onCheckedChange={(checked) => onToggle(item.id, checked)}
      />
    </div>
  );
};

const NavigationOrderManager: React.FC = () => {
  const { organization, loading: orgLoading } = useCurrentOrganization();
  const { config, isLoading, saveConfig, isSaving, resetConfig, isResetting } = useNavigationConfig(organization?.id);
  const [items, setItems] = useState<NavigationItemConfig[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (config?.items) {
      const sortedItems = [...config.items].sort((a, b) => a.order - b.order);
      setItems(sortedItems);
      setHasChanges(false);
    }
  }, [config]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex).map((item, idx) => ({
          ...item,
          order: idx,
        }));
        return newItems;
      });
      setHasChanges(true);
    }
  };

  const handleToggle = (id: string, enabled: boolean) => {
    setItems((items) =>
      items.map((item) => (item.id === id ? { ...item, enabled } : item))
    );
    setHasChanges(true);
  };

  const handleLabelChange = (id: string, customLabel: string) => {
    setItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, customLabel: customLabel || undefined } : item
      )
    );
    setHasChanges(true);
  };

  const handleSave = () => {
    saveConfig({ items });
    setHasChanges(false);
  };

  const handleReset = () => {
    resetConfig();
  };

  if (orgLoading || isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Navigation Menu Order</CardTitle>
        <CardDescription>
          Drag items to reorder. Toggle switches to show or hide menu items. Use custom labels to rename items.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((item) => (
                <SortableNavItem
                  key={item.id}
                  item={item}
                  onToggle={handleToggle}
                  onLabelChange={handleLabelChange}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {items.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            No navigation items configured yet.
          </p>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isResetting}
          >
            {isResetting ? 'Resetting...' : 'Reset to Default'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NavigationOrderManager;
