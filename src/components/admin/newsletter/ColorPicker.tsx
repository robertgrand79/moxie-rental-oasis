import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Palette } from 'lucide-react';

interface ColorPickerProps {
  color?: string;
  onChange: (color: string) => void;
  icon?: React.ReactNode;
}

const predefinedColors = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
  '#008000', '#ffc0cb', '#a52a2a', '#808080', '#000080'
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, icon }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="p-2">
          {icon || <Palette className="h-4 w-4" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4">
        <div className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            {predefinedColors.map((presetColor) => (
              <button
                key={presetColor}
                className="w-8 h-8 rounded border-2 border-border hover:scale-110 transition-transform"
                style={{ backgroundColor: presetColor }}
                onClick={() => onChange(presetColor)}
                title={presetColor}
              />
            ))}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Custom Color</label>
            <input
              type="color"
              value={color || '#000000'}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-10 rounded border border-border cursor-pointer"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};