import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import IconPicker from './IconPicker';
import { HomeAmenity } from '@/hooks/useHomeAmenities';

interface AmenityFormProps {
  isOpen: boolean;
  onClose: () => void;
  amenity: Partial<HomeAmenity> | null;
  onSave: (data: { name: string; icon_name: string; color: string; is_active: boolean }) => void;
  isLoading?: boolean;
}

const AmenityForm: React.FC<AmenityFormProps> = ({
  isOpen,
  onClose,
  amenity,
  onSave,
  isLoading,
}) => {
  const [name, setName] = React.useState(amenity?.name || '');
  const [iconName, setIconName] = React.useState(amenity?.icon_name || 'Star');
  const [color, setColor] = React.useState(amenity?.color || 'text-blue-500');
  const [isActive, setIsActive] = React.useState(amenity?.is_active ?? true);

  React.useEffect(() => {
    if (amenity) {
      setName(amenity.name || '');
      setIconName(amenity.icon_name || 'Star');
      setColor(amenity.color || 'text-blue-500');
      setIsActive(amenity.is_active ?? true);
    } else {
      setName('');
      setIconName('Star');
      setColor('text-blue-500');
      setIsActive(true);
    }
  }, [amenity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), icon_name: iconName, color, is_active: isActive });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{amenity?.id ? 'Edit Amenity' : 'Add Amenity'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Amenity Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., High-Speed WiFi"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Icon & Color</Label>
            <IconPicker
              selectedIcon={iconName}
              selectedColor={color}
              onIconChange={setIconName}
              onColorChange={setColor}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is-active">Active</Label>
            <Switch
              id="is-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {amenity?.id ? 'Update' : 'Add'} Amenity
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AmenityForm;
