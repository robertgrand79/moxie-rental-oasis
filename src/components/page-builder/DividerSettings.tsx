
import React from 'react';
import { useNode } from '@craftjs/core';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

export const DividerSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="color">Color</Label>
        <Input
          id="color"
          type="color"
          value={props.color}
          onChange={(e) => setProp((props: any) => props.color = e.target.value)}
        />
      </div>

      <div>
        <Label>Thickness: {props.thickness}px</Label>
        <Slider
          value={[props.thickness]}
          onValueChange={(value) => setProp((props: any) => props.thickness = value[0])}
          max={10}
          min={1}
          step={1}
        />
      </div>

      <div>
        <Label>Margin: {props.margin}px</Label>
        <Slider
          value={[props.margin]}
          onValueChange={(value) => setProp((props: any) => props.margin = value[0])}
          max={50}
          min={0}
          step={5}
        />
      </div>
    </div>
  );
};
