
import React from 'react';
import { useNode } from '@craftjs/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const ContainerSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="background">Background Color</Label>
        <Input
          id="background"
          type="color"
          value={props.background}
          onChange={(e) => setProp((props) => props.background = e.target.value)}
        />
      </div>
      
      <div>
        <Label htmlFor="padding">Padding</Label>
        <Input
          id="padding"
          type="number"
          value={props.padding}
          onChange={(e) => setProp((props) => props.padding = parseInt(e.target.value))}
        />
      </div>
    </div>
  );
};
