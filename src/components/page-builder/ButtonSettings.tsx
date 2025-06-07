
import React from 'react';
import { useNode } from '@craftjs/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const ButtonSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="text">Button Text</Label>
        <Input
          id="text"
          value={props.text}
          onChange={(e) => setProp((props) => props.text = e.target.value)}
        />
      </div>
      
      <div>
        <Label htmlFor="backgroundColor">Background Color</Label>
        <Input
          id="backgroundColor"
          type="color"
          value={props.backgroundColor}
          onChange={(e) => setProp((props) => props.backgroundColor = e.target.value)}
        />
      </div>
      
      <div>
        <Label htmlFor="textColor">Text Color</Label>
        <Input
          id="textColor"
          type="color"
          value={props.textColor}
          onChange={(e) => setProp((props) => props.textColor = e.target.value)}
        />
      </div>
      
      <div>
        <Label htmlFor="href">Link URL (optional)</Label>
        <Input
          id="href"
          value={props.href}
          onChange={(e) => setProp((props) => props.href = e.target.value)}
          placeholder="https://example.com"
        />
      </div>
    </div>
  );
};
