import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as LucideIcons from 'lucide-react';
import { Search } from 'lucide-react';

// Common amenity-related icons
const COMMON_ICONS = [
  'Wifi', 'Car', 'Coffee', 'Utensils', 'Tv', 'Waves', 'TreePine', 'Dumbbell',
  'Snowflake', 'Flame', 'Wind', 'Droplets', 'Sun', 'Moon', 'Star', 'Heart',
  'Home', 'Building', 'Bed', 'Bath', 'Shower', 'Armchair', 'Sofa', 'Lamp',
  'WashingMachine', 'Refrigerator', 'Microwave', 'CookingPot', 'UtensilsCrossed',
  'Wine', 'Beer', 'Martini', 'Baby', 'Dog', 'Cat', 'Bike', 'Mountain',
  'Palmtree', 'Flower', 'Leaf', 'Trees', 'Fence', 'Pool', 'Waves',
  'Music', 'Gamepad', 'Monitor', 'Smartphone', 'Laptop', 'Printer',
  'Lock', 'Key', 'Shield', 'Camera', 'Video', 'Phone', 'Mail',
  'Clock', 'Calendar', 'MapPin', 'Navigation', 'Compass', 'Map',
  'Plane', 'Train', 'Bus', 'Ship', 'Anchor', 'Umbrella', 'Briefcase',
  'Luggage', 'Ticket', 'CreditCard', 'Wallet', 'Gift', 'Package',
  'Sparkles', 'Zap', 'Award', 'Trophy', 'Crown', 'Gem', 'Diamond',
  'Accessibility', 'Wheelchair', 'HeartHandshake', 'Users', 'UserCheck',
];

const ICON_COLORS = [
  { name: 'Blue', value: 'text-blue-500' },
  { name: 'Gray', value: 'text-gray-500' },
  { name: 'Amber', value: 'text-amber-500' },
  { name: 'Emerald', value: 'text-emerald-500' },
  { name: 'Purple', value: 'text-purple-500' },
  { name: 'Teal', value: 'text-teal-500' },
  { name: 'Green', value: 'text-green-500' },
  { name: 'Orange', value: 'text-orange-500' },
  { name: 'Red', value: 'text-red-500' },
  { name: 'Pink', value: 'text-pink-500' },
  { name: 'Indigo', value: 'text-indigo-500' },
  { name: 'Cyan', value: 'text-cyan-500' },
];

interface IconPickerProps {
  selectedIcon: string;
  selectedColor: string;
  onIconChange: (icon: string) => void;
  onColorChange: (color: string) => void;
}

const IconPicker: React.FC<IconPickerProps> = ({
  selectedIcon,
  selectedColor,
  onIconChange,
  onColorChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const getIconComponent = (iconName: string): React.ComponentType<{ className?: string }> => {
    const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
    return icons[iconName] || LucideIcons.Star;
  };

  const filteredIcons = COMMON_ICONS.filter(icon =>
    icon.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const SelectedIconComponent = getIconComponent(selectedIcon);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-16 h-16 p-0">
              <SelectedIconComponent className={`h-8 w-8 ${selectedColor}`} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3" align="start">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search icons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <ScrollArea className="h-48">
                <div className="grid grid-cols-6 gap-1">
                  {filteredIcons.map((iconName) => {
                    const IconComponent = getIconComponent(iconName);
                    return (
                      <Button
                        key={iconName}
                        variant={selectedIcon === iconName ? 'secondary' : 'ghost'}
                        size="icon"
                        className="h-10 w-10"
                        onClick={() => {
                          onIconChange(iconName);
                          setIsOpen(false);
                        }}
                        title={iconName}
                      >
                        <IconComponent className="h-5 w-5" />
                      </Button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </PopoverContent>
        </Popover>

        <div className="flex-1">
          <p className="text-sm font-medium mb-2">Icon Color</p>
          <div className="flex flex-wrap gap-1">
            {ICON_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => onColorChange(color.value)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  selectedColor === color.value 
                    ? 'border-foreground scale-110' 
                    : 'border-transparent hover:scale-105'
                }`}
                title={color.name}
              >
                <span className={`block w-full h-full rounded-full ${color.value.replace('text-', 'bg-')}`} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconPicker;
